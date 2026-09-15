import {
  ServiceUnavailableException,
  ValidationPipe,
  type INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import {
  AI_PROVIDER,
  type AiProvider,
} from '../src/ai/providers/ai-provider.interface.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

interface SignedUpWorkspaceOwner {
  user: { id: string };
  workspace: { id: string };
  accessToken: string;
}

interface BillingUsageResponse {
  plan: 'FREE' | 'PRO';
  usage: {
    aiMessages: number;
    limit: number;
    periodStart: string;
  };
}

interface DevelopmentCheckoutResponse {
  checkoutId: string;
  plan: 'PRO';
  status: 'pending';
}

interface AgentResponse {
  id: string;
  publicId: string;
}

interface PublicConversationResponse {
  conversation: { id: string };
  sessionToken: string;
}

class TestAiProvider implements AiProvider {
  shouldFail = false;

  async generateResponse(): Promise<string> {
    if (this.shouldFail) {
      throw new ServiceUnavailableException('Test AI provider is unavailable');
    }

    return 'Test AI response';
  }
}

describe('Billing (e2e)', () => {
  const testAiProvider = new TestAiProvider();
  const createdUserIds: string[] = [];
  const testRunId = randomUUID().replace(/-/g, '');
  const password = 'BillingE2eTest123!';
  let app: INestApplication;
  let prisma: PrismaService;

  const authorization = (accessToken: string) => ({
    Authorization: `Bearer ${accessToken}`,
  });

  async function signUp(label: string): Promise<SignedUpWorkspaceOwner> {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        firstName: 'Billing',
        lastName: label,
        email: `billing-e2e-${testRunId}-${label.toLowerCase()}@example.invalid`,
        password,
        workspaceName: `Billing E2E ${label} ${testRunId.slice(0, 8)}`,
      });

    expect(response.status).toBe(201);
    const result = response.body as SignedUpWorkspaceOwner;
    createdUserIds.push(result.user.id);

    return result;
  }

  async function setUsage(
    workspaceId: string,
    periodStart: string,
    aiMessageCount: number,
  ): Promise<void> {
    await prisma.usageRecord.update({
      where: {
        workspaceId_periodStart: {
          workspaceId,
          periodStart: new Date(periodStart),
        },
      },
      data: { aiMessageCount },
    });
  }

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AI_PROVIDER)
      .useValue(testAiProvider)
      .compile();

    app = moduleFixture.createNestApplication();
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

  it('simulates workspace-scoped checkout, cancellation, and protected usage', async () => {
    const ownerA = await signUp('OwnerA');
    const ownerB = await signUp('OwnerB');
    const ownerC = await signUp('OwnerC');

    await request(app.getHttpServer()).get('/billing/subscription').expect(401);

    const freeSubscription = await request(app.getHttpServer())
      .get('/billing/subscription')
      .set(authorization(ownerA.accessToken));
    expect(freeSubscription.status).toBe(200);
    expect(freeSubscription.body).toMatchObject({
      plan: 'FREE',
      status: 'ACTIVE',
    });

    const checkout = await request(app.getHttpServer())
      .post('/billing/checkout')
      .set(authorization(ownerA.accessToken));
    expect(checkout.status).toBe(201);
    const checkoutSession = checkout.body as DevelopmentCheckoutResponse;
    expect(checkoutSession).toMatchObject({ plan: 'PRO', status: 'pending' });
    expect(checkoutSession.checkoutId).toMatch(/^dev_checkout_[a-f0-9]{32}$/);

    const repeatedCheckout = await request(app.getHttpServer())
      .post('/billing/checkout')
      .set(authorization(ownerA.accessToken));
    expect(repeatedCheckout.status).toBe(201);
    expect(repeatedCheckout.body.checkoutId).toBe(checkoutSession.checkoutId);

    await request(app.getHttpServer())
      .post(`/billing/checkout/${checkoutSession.checkoutId}/complete`)
      .set(authorization(ownerB.accessToken))
      .expect(404);

    const completion = await request(app.getHttpServer())
      .post(`/billing/checkout/${checkoutSession.checkoutId}/complete`)
      .set(authorization(ownerA.accessToken));
    expect(completion.status).toBe(200);
    expect(completion.body).toMatchObject({
      checkoutId: checkoutSession.checkoutId,
      status: 'completed',
      subscription: { plan: 'PRO', status: 'ACTIVE' },
    });

    const repeatedCompletion = await request(app.getHttpServer())
      .post(`/billing/checkout/${checkoutSession.checkoutId}/complete`)
      .set(authorization(ownerA.accessToken));
    expect(repeatedCompletion.status).toBe(200);
    expect(repeatedCompletion.body.status).toBe('completed');

    await request(app.getHttpServer())
      .post('/billing/checkout')
      .set(authorization(ownerA.accessToken))
      .expect(409);

    const proUsage = await request(app.getHttpServer())
      .get('/billing/usage')
      .set(authorization(ownerA.accessToken));
    expect(proUsage.status).toBe(200);
    expect((proUsage.body as BillingUsageResponse).usage.limit).toBe(5_000);

    const cancelledSubscription = await request(app.getHttpServer())
      .post('/billing/subscription/cancel')
      .set(authorization(ownerA.accessToken));
    expect(cancelledSubscription.status).toBe(200);
    expect(cancelledSubscription.body).toMatchObject({
      plan: 'FREE',
      status: 'ACTIVE',
    });

    const repeatedCancellation = await request(app.getHttpServer())
      .post('/billing/subscription/cancel')
      .set(authorization(ownerA.accessToken));
    expect(repeatedCancellation.status).toBe(200);
    expect(repeatedCancellation.body).toMatchObject({
      plan: 'FREE',
      status: 'ACTIVE',
    });

    const postCancellationReplay = await request(app.getHttpServer())
      .post(`/billing/checkout/${checkoutSession.checkoutId}/complete`)
      .set(authorization(ownerA.accessToken));
    expect(postCancellationReplay.status).toBe(200);
    expect(postCancellationReplay.body.status).toBe('completed');

    const subscriptionAfterReplay = await request(app.getHttpServer())
      .get('/billing/subscription')
      .set(authorization(ownerA.accessToken));
    expect(subscriptionAfterReplay.body).toMatchObject({
      plan: 'FREE',
      status: 'ACTIVE',
    });

    const freeCancellation = await request(app.getHttpServer())
      .post('/billing/subscription/cancel')
      .set(authorization(ownerB.accessToken));
    expect(freeCancellation.status).toBe(200);
    expect(freeCancellation.body).toMatchObject({
      plan: 'FREE',
      status: 'ACTIVE',
    });

    await Promise.all(
      Array.from({ length: 10 }, () =>
        request(app.getHttpServer())
          .get('/billing/usage')
          .set(authorization(ownerC.accessToken)),
      ),
    );
    expect(
      await prisma.usageRecord.count({
        where: { workspaceId: ownerC.workspace.id },
      }),
    ).toBe(1);

    const agentAResponse = await request(app.getHttpServer())
      .post('/agents')
      .set(authorization(ownerA.accessToken))
      .send({ name: 'Billing usage private agent' });
    expect(agentAResponse.status).toBe(201);
    const agentA = agentAResponse.body as AgentResponse;

    const privateUsage = await request(app.getHttpServer())
      .get('/billing/usage')
      .set(authorization(ownerA.accessToken));
    const privateUsageResponse = privateUsage.body as BillingUsageResponse;
    await setUsage(
      ownerA.workspace.id,
      privateUsageResponse.usage.periodStart,
      99,
    );

    testAiProvider.shouldFail = true;
    await request(app.getHttpServer())
      .post(`/agents/${agentA.id}/test-chat`)
      .set(authorization(ownerA.accessToken))
      .send({ message: 'Should not consume usage on AI failure' })
      .expect(503);
    testAiProvider.shouldFail = false;

    const usageAfterFailure = await request(app.getHttpServer())
      .get('/billing/usage')
      .set(authorization(ownerA.accessToken));
    expect(
      (usageAfterFailure.body as BillingUsageResponse).usage.aiMessages,
    ).toBe(99);

    const concurrentPrivateResponses = await Promise.all([
      request(app.getHttpServer())
        .post(`/agents/${agentA.id}/test-chat`)
        .set(authorization(ownerA.accessToken))
        .send({ message: 'First concurrent private request' }),
      request(app.getHttpServer())
        .post(`/agents/${agentA.id}/test-chat`)
        .set(authorization(ownerA.accessToken))
        .send({ message: 'Second concurrent private request' }),
    ]);
    expect(
      concurrentPrivateResponses.map((response) => response.status).sort(),
    ).toEqual([200, 429]);
    const privateLimitError = concurrentPrivateResponses.find(
      (response) => response.status === 429,
    );
    expect(privateLimitError?.body).toMatchObject({
      code: 'AI_USAGE_LIMIT_REACHED',
      limit: 100,
      used: 100,
      plan: 'FREE',
    });

    const agentBResponse = await request(app.getHttpServer())
      .post('/agents')
      .set(authorization(ownerB.accessToken))
      .send({ name: 'Billing usage public agent' });
    expect(agentBResponse.status).toBe(201);
    const agentB = agentBResponse.body as AgentResponse;

    const publicConversation = await request(app.getHttpServer())
      .post(`/public/agents/${agentB.publicId}/conversations`)
      .expect(201);
    const publicConversationResponse =
      publicConversation.body as PublicConversationResponse;

    const publicUsage = await request(app.getHttpServer())
      .get('/billing/usage')
      .set(authorization(ownerB.accessToken));
    const publicUsageResponse = publicUsage.body as BillingUsageResponse;
    await setUsage(
      ownerB.workspace.id,
      publicUsageResponse.usage.periodStart,
      99,
    );

    await request(app.getHttpServer())
      .post(
        `/public/conversations/${publicConversationResponse.conversation.id}/messages`,
      )
      .send({
        sessionToken: publicConversationResponse.sessionToken,
        message: 'Public customer request within the plan limit',
      })
      .expect(200);

    const publicLimitError = await request(app.getHttpServer())
      .post(
        `/public/conversations/${publicConversationResponse.conversation.id}/messages`,
      )
      .send({
        sessionToken: publicConversationResponse.sessionToken,
        message: 'Public customer request over the plan limit',
      });
    expect(publicLimitError.status).toBe(429);
    expect(publicLimitError.body).toMatchObject({
      code: 'AI_USAGE_LIMIT_REACHED',
      limit: 100,
      used: 100,
      plan: 'FREE',
    });
  }, 60_000);
});
