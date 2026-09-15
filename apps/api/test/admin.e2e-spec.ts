import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import {
  MessageRole,
  SubscriptionPlan,
  SubscriptionStatus,
  UserRole,
} from '../src/generated/prisma/client.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

interface SignUpResponse {
  user: { id: string; email: string };
  workspace: { id: string; name: string };
  accessToken: string;
}

interface OverviewResponse {
  totalUsers: number;
  totalWorkspaces: number;
  totalAgents: number;
  totalConversations: number;
  totalMessages: number;
  totalAiMessages: number;
  freeWorkspaces: number;
  proWorkspaces: number;
  activeSubscriptions: number;
}

describe('Admin API (e2e)', () => {
  const createdUserIds: string[] = [];
  const testRunId = randomUUID().replace(/-/g, '');
  const password = 'AdminE2eTest123!';
  let app: INestApplication;
  let prisma: PrismaService;

  const authorization = (accessToken: string) => ({
    Authorization: `Bearer ${accessToken}`,
  });

  async function signUp(
    label: string,
    firstName = label,
    workspaceName = `Admin Workspace ${label} ${testRunId.slice(0, 8)}`,
  ): Promise<SignUpResponse> {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        firstName,
        lastName: 'AdminTest',
        email: `admin-e2e-${testRunId}-${label.toLowerCase()}@example.invalid`,
        password,
        workspaceName,
      })
      .expect(201);
    const result = response.body as SignUpResponse;
    createdUserIds.push(result.user.id);

    return result;
  }

  async function getExpectedOverview(): Promise<OverviewResponse> {
    const [
      totalUsers,
      totalWorkspaces,
      totalAgents,
      totalConversations,
      totalMessages,
      aiMessageUsage,
      freeWorkspaces,
      proWorkspaces,
      activeSubscriptions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.workspace.count(),
      prisma.agent.count(),
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.usageRecord.aggregate({ _sum: { aiMessageCount: true } }),
      prisma.workspace.count({
        where: { subscription: { is: { plan: SubscriptionPlan.FREE } } },
      }),
      prisma.workspace.count({
        where: { subscription: { is: { plan: SubscriptionPlan.PRO } } },
      }),
      prisma.subscription.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
    ]);

    return {
      totalUsers,
      totalWorkspaces,
      totalAgents,
      totalConversations,
      totalMessages,
      totalAiMessages: aiMessageUsage._sum.aiMessageCount ?? 0,
      freeWorkspaces,
      proWorkspaces,
      activeSubscriptions,
    };
  }

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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

  it('protects admin data and returns database-backed dashboard results', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        firstName: 'Role',
        lastName: 'Injection',
        email: `admin-e2e-${testRunId}-forbidden-role@example.invalid`,
        password,
        workspaceName: `Forbidden role ${testRunId.slice(0, 8)}`,
        role: 'ADMIN',
      })
      .expect(400);

    const searchTerm = `AdminSearch${testRunId.slice(0, 8)}`;
    const workspaceSearchTerm = `AdminWorkspace${testRunId.slice(0, 8)}`;
    const admin = await signUp('Administrator');
    const firstUser = await signUp(
      'SearchOne',
      searchTerm,
      `${workspaceSearchTerm} One`,
    );
    const secondUser = await signUp(
      'SearchTwo',
      searchTerm,
      `${workspaceSearchTerm} Two`,
    );

    const initialRole = await prisma.user.findUniqueOrThrow({
      where: { id: admin.user.id },
      select: { role: true },
    });
    expect(initialRole.role).toBe(UserRole.USER);

    await prisma.user.update({
      where: { id: admin.user.id },
      data: { role: UserRole.ADMIN },
    });

    const agent = await prisma.agent.create({
      data: {
        workspaceId: firstUser.workspace.id,
        name: 'Admin reporting agent',
        slug: `admin-reporting-${testRunId}`,
      },
    });
    const conversation = await prisma.conversation.create({
      data: { agentId: agent.id },
    });
    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          role: MessageRole.USER,
          content: 'Admin reporting test message',
        },
        {
          conversationId: conversation.id,
          role: MessageRole.ASSISTANT,
          content: 'Admin reporting test response',
        },
      ],
    });

    const firstSubscription = await prisma.subscription.findUniqueOrThrow({
      where: { workspaceId: firstUser.workspace.id },
    });
    await prisma.usageRecord.upsert({
      where: {
        workspaceId_periodStart: {
          workspaceId: firstUser.workspace.id,
          periodStart: firstSubscription.currentPeriodStart,
        },
      },
      create: {
        workspaceId: firstUser.workspace.id,
        periodStart: firstSubscription.currentPeriodStart,
        periodEnd: firstSubscription.currentPeriodEnd,
        aiMessageCount: 3,
      },
      update: { aiMessageCount: 3 },
    });
    await prisma.subscription.update({
      where: { workspaceId: secondUser.workspace.id },
      data: {
        plan: SubscriptionPlan.PRO,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    await request(app.getHttpServer()).get('/admin/overview').expect(401);

    await request(app.getHttpServer())
      .get('/admin/overview')
      .set(authorization(firstUser.accessToken))
      .expect(403);

    const expectedOverview = await getExpectedOverview();
    const overview = await request(app.getHttpServer())
      .get('/admin/overview')
      .set(authorization(admin.accessToken))
      .expect(200);
    expect(overview.body).toEqual(expectedOverview);

    const userResults = await request(app.getHttpServer())
      .get(`/admin/users?search=${searchTerm}&page=2&limit=1`)
      .set(authorization(admin.accessToken))
      .expect(200);
    expect(userResults.body.meta).toMatchObject({
      page: 2,
      limit: 1,
      total: 2,
      totalPages: 2,
    });
    expect(userResults.body.data).toHaveLength(1);
    expect(userResults.body.data[0]).toMatchObject({
      role: UserRole.USER,
      workspaces: [
        {
          subscription: { status: SubscriptionStatus.ACTIVE },
        },
      ],
    });
    const serializedUserResults = JSON.stringify(userResults.body);
    expect(serializedUserResults).not.toContain('passwordHash');
    expect(serializedUserResults).not.toContain('refreshTokenHash');
    expect(serializedUserResults).not.toContain('stripeCustomerId');
    expect(serializedUserResults).not.toContain('stripeSubscriptionId');

    const workspaceResults = await request(app.getHttpServer())
      .get(`/admin/workspaces?search=${workspaceSearchTerm}&page=2&limit=1`)
      .set(authorization(admin.accessToken))
      .expect(200);
    expect(workspaceResults.body.meta).toMatchObject({
      page: 2,
      limit: 1,
      total: 2,
      totalPages: 2,
    });
    expect(workspaceResults.body.data).toHaveLength(1);

    const workspaceByOwnerEmail = await request(app.getHttpServer())
      .get(
        `/admin/workspaces?search=${encodeURIComponent(firstUser.user.email)}`,
      )
      .set(authorization(admin.accessToken))
      .expect(200);
    expect(workspaceByOwnerEmail.body.data).toHaveLength(1);
    expect(workspaceByOwnerEmail.body.data[0]).toMatchObject({
      id: firstUser.workspace.id,
      owner: { email: firstUser.user.email },
      agentCount: 1,
      conversationCount: 1,
    });

    const subscriptions = await request(app.getHttpServer())
      .get('/admin/subscriptions?plan=pro&status=active&limit=100')
      .set(authorization(admin.accessToken))
      .expect(200);
    const proSubscription = subscriptions.body.data.find(
      (subscription: { workspace: { id: string } }) =>
        subscription.workspace.id === secondUser.workspace.id,
    );
    expect(proSubscription).toMatchObject({
      plan: SubscriptionPlan.PRO,
      status: SubscriptionStatus.ACTIVE,
      workspace: {
        id: secondUser.workspace.id,
        owner: { email: secondUser.user.email },
      },
      usage: { aiMessages: 0, limit: 5_000 },
    });
    const serializedSubscriptionResults = JSON.stringify(subscriptions.body);
    expect(serializedSubscriptionResults).not.toContain('stripeCustomerId');
    expect(serializedSubscriptionResults).not.toContain('stripeSubscriptionId');
  }, 60_000);
});
