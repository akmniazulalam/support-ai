import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import {
  AI_PROVIDER,
  type AiProvider,
} from '../src/ai/providers/ai-provider.interface.js';
import { getCorsConfiguration } from '../src/config/cors.config.js';
import { MessageRole } from '../src/generated/prisma/client.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

interface SignUpResponse {
  user: { id: string; email: string };
  workspace: { id: string };
  accessToken: string;
}

interface PublicConversationResponse {
  conversation: { id: string; createdAt: string };
  sessionToken: string;
}

class TestAiProvider implements AiProvider {
  async generateResponse(): Promise<string> {
    return 'Widget-ready AI response';
  }
}

describe('Public widget API readiness (e2e)', () => {
  const createdUserIds: string[] = [];
  const testRunId = randomUUID().replace(/-/g, '');
  const password = 'PublicWidgetE2e123!';
  let app: NestExpressApplication;
  let prisma: PrismaService;

  async function signUp(): Promise<SignUpResponse> {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        firstName: 'Public',
        lastName: 'Widget',
        email: `public-widget-${testRunId}@example.invalid`,
        password,
        workspaceName: `Public Widget ${testRunId.slice(0, 8)}`,
      })
      .expect(201);
    const result = response.body as SignUpResponse;
    createdUserIds.push(result.user.id);

    return result;
  }

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AI_PROVIDER)
      .useValue(new TestAiProvider())
      .compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.enableCors(
      getCorsConfiguration('https://customer.example', 'production'),
    );
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        validationError: { target: false, value: false },
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }

    await app.close();
  });

  it('supports the safe public widget contract without exposing internal IDs', async () => {
    const owner = await signUp();
    const activeAgent = await prisma.agent.create({
      data: {
        workspaceId: owner.workspace.id,
        name: 'Widget Support',
        slug: `widget-support-${testRunId}`,
        greeting: 'Welcome to Widget Support.',
        instructions: 'Private agent instructions must never be public.',
      },
    });
    const inactiveAgent = await prisma.agent.create({
      data: {
        workspaceId: owner.workspace.id,
        name: 'Inactive Widget Support',
        slug: `inactive-widget-support-${testRunId}`,
        isActive: false,
      },
    });

    const preflight = await request(app.getHttpServer())
      .options(`/public/agents/${activeAgent.publicId}/conversations`)
      .set('Origin', 'https://customer.example')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type')
      .expect(204);
    expect(preflight.headers['access-control-allow-origin']).toBe(
      'https://customer.example',
    );
    expect(
      preflight.headers['access-control-allow-credentials'],
    ).toBeUndefined();

    const publicAgent = await request(app.getHttpServer())
      .get(`/public/agents/${activeAgent.publicId}`)
      .set('Origin', 'https://customer.example')
      .expect(200);
    expect(publicAgent.headers['access-control-allow-origin']).toBe(
      'https://customer.example',
    );
    expect(publicAgent.body).toEqual({
      agent: {
        publicId: activeAgent.publicId,
        name: 'Widget Support',
        greeting: 'Welcome to Widget Support.',
      },
    });

    const disallowedOrigin = await request(app.getHttpServer())
      .get(`/public/agents/${activeAgent.publicId}`)
      .set('Origin', 'https://untrusted.example')
      .expect(200);
    expect(
      disallowedOrigin.headers['access-control-allow-origin'],
    ).toBeUndefined();

    await request(app.getHttpServer())
      .get('/public/agents/not-a-real-public-id')
      .expect(404);
    await request(app.getHttpServer())
      .get(`/public/agents/${inactiveAgent.publicId}`)
      .expect(404);

    const createdConversation = await request(app.getHttpServer())
      .post(`/public/agents/${activeAgent.publicId}/conversations`)
      .expect(201);
    const firstConversation =
      createdConversation.body as PublicConversationResponse;
    expect(firstConversation.conversation.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    const storedConversation = await prisma.conversation.findUniqueOrThrow({
      where: { publicId: firstConversation.conversation.id },
    });
    expect(firstConversation.conversation.id).not.toBe(storedConversation.id);

    const validConversation = await request(app.getHttpServer())
      .get(`/public/conversations/${firstConversation.conversation.id}`)
      .set('Authorization', `Bearer ${firstConversation.sessionToken}`)
      .expect(200);
    expect(validConversation.body).toEqual({
      conversation: {
        id: firstConversation.conversation.id,
        messages: [],
      },
    });

    await request(app.getHttpServer())
      .get(`/public/conversations/${firstConversation.conversation.id}`)
      .set('Authorization', 'Bearer invalid-session-token')
      .expect(404);

    const secondConversationResponse = await request(app.getHttpServer())
      .post(`/public/agents/${activeAgent.publicId}/conversations`)
      .expect(201);
    const secondConversation =
      secondConversationResponse.body as PublicConversationResponse;
    await request(app.getHttpServer())
      .get(`/public/conversations/${firstConversation.conversation.id}`)
      .set('Authorization', `Bearer ${secondConversation.sessionToken}`)
      .expect(404);

    const sentMessage = await request(app.getHttpServer())
      .post(
        `/public/conversations/${firstConversation.conversation.id}/messages`,
      )
      .send({
        sessionToken: firstConversation.sessionToken,
        message: 'Can the widget receive a safe response?',
      })
      .expect(200);
    expect(sentMessage.body.message).toMatchObject({
      role: MessageRole.ASSISTANT,
      content: 'Widget-ready AI response',
    });
    expect(sentMessage.body.message.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    const storedMessages = await prisma.message.findMany({
      where: { conversationId: storedConversation.id },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: { id: true, publicId: true, role: true },
    });
    expect(storedMessages).toHaveLength(2);
    const assistantMessage = storedMessages.find(
      (message) => message.role === MessageRole.ASSISTANT,
    );
    expect(assistantMessage).toBeDefined();
    expect(sentMessage.body.message.id).toBe(assistantMessage?.publicId);
    expect(sentMessage.body.message.id).not.toBe(assistantMessage?.id);

    const publicHistory = await request(app.getHttpServer())
      .get(`/public/conversations/${firstConversation.conversation.id}`)
      .set('Authorization', `Bearer ${firstConversation.sessionToken}`)
      .expect(200);
    expect(publicHistory.body.conversation.messages).toHaveLength(2);
    expect(
      publicHistory.body.conversation.messages.map(
        (message: { role: string }) => message.role,
      ),
    ).toEqual([MessageRole.USER, MessageRole.ASSISTANT]);
    expect(
      publicHistory.body.conversation.messages.map(
        (message: { id: string }) => message.id,
      ),
    ).toEqual(storedMessages.map((message) => message.publicId));
    const serializedPublicData = JSON.stringify({
      publicAgent: publicAgent.body,
      conversation: firstConversation,
      message: sentMessage.body,
      history: publicHistory.body,
    });
    expect(serializedPublicData).not.toContain(storedConversation.id);
    for (const storedMessage of storedMessages) {
      expect(serializedPublicData).not.toContain(storedMessage.id);
    }
    expect(serializedPublicData).not.toContain(activeAgent.id);
    expect(serializedPublicData).not.toContain(owner.workspace.id);
    expect(serializedPublicData).not.toContain('instructions');
    expect(serializedPublicData).not.toContain('customerSessionTokenHash');

    await request(app.getHttpServer()).get('/agents').expect(401);
    await request(app.getHttpServer())
      .get('/admin/overview')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(403);
  }, 60_000);
});
