import { Injectable } from '@nestjs/common';
import {
  Prisma,
  SubscriptionPlan,
  SubscriptionStatus,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { getAiMessageLimit } from '../billing/plan-limits.js';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  type AdminPaginationQueryDto,
} from './dto/admin-pagination-query.dto.js';
import { type AdminSearchPaginationQueryDto } from './dto/admin-search-pagination-query.dto.js';
import { type AdminSubscriptionsQueryDto } from './dto/admin-subscriptions-query.dto.js';

interface Pagination {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const adminUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  workspaces: {
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      subscription: {
        select: {
          plan: true,
          status: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect;

const adminWorkspaceSelect = {
  id: true,
  name: true,
  slug: true,
  createdAt: true,
  owner: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  },
  subscription: {
    select: {
      plan: true,
      status: true,
    },
  },
  _count: {
    select: {
      agents: true,
    },
  },
  agents: {
    select: {
      _count: {
        select: {
          conversations: true,
        },
      },
    },
  },
} satisfies Prisma.WorkspaceSelect;

const adminSubscriptionSelect = {
  workspaceId: true,
  plan: true,
  status: true,
  currentPeriodStart: true,
  currentPeriodEnd: true,
  createdAt: true,
  updatedAt: true,
  workspace: {
    select: {
      id: true,
      name: true,
      slug: true,
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  },
} satisfies Prisma.SubscriptionSelect;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
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
      this.prisma.user.count(),
      this.prisma.workspace.count(),
      this.prisma.agent.count(),
      this.prisma.conversation.count(),
      this.prisma.message.count(),
      this.prisma.usageRecord.aggregate({
        _sum: { aiMessageCount: true },
      }),
      this.prisma.workspace.count({
        where: {
          subscription: {
            is: { plan: SubscriptionPlan.FREE },
          },
        },
      }),
      this.prisma.workspace.count({
        where: {
          subscription: {
            is: { plan: SubscriptionPlan.PRO },
          },
        },
      }),
      this.prisma.subscription.count({
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

  async getUsers(query: AdminSearchPaginationQueryDto) {
    const pagination = this.getPagination(query);
    const where = this.createUserSearchWhere(query.search);
    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: adminUserSelect,
      }),
    ]);

    return {
      data: users,
      meta: this.createPaginationMeta(pagination, total),
    };
  }

  async getWorkspaces(query: AdminSearchPaginationQueryDto) {
    const pagination = this.getPagination(query);
    const where = this.createWorkspaceSearchWhere(query.search);
    const [total, workspaces] = await Promise.all([
      this.prisma.workspace.count({ where }),
      this.prisma.workspace.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: adminWorkspaceSelect,
      }),
    ]);

    return {
      data: workspaces.map(({ agents, _count, ...workspace }) => ({
        ...workspace,
        agentCount: _count.agents,
        conversationCount: agents.reduce(
          (totalConversations, agent) =>
            totalConversations + agent._count.conversations,
          0,
        ),
      })),
      meta: this.createPaginationMeta(pagination, total),
    };
  }

  async getSubscriptions(query: AdminSubscriptionsQueryDto) {
    const pagination = this.getPagination(query);
    const where: Prisma.SubscriptionWhereInput = {
      ...(query.plan === undefined ? {} : { plan: query.plan }),
      ...(query.status === undefined ? {} : { status: query.status }),
    };
    const [total, subscriptions] = await Promise.all([
      this.prisma.subscription.count({ where }),
      this.prisma.subscription.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: adminSubscriptionSelect,
      }),
    ]);
    const currentUsageRecords =
      await this.getCurrentUsageRecords(subscriptions);

    return {
      data: subscriptions.map((subscription) => {
        const usage = currentUsageRecords.get(
          this.getUsageRecordKey(
            subscription.workspaceId,
            subscription.currentPeriodStart,
          ),
        );

        return {
          plan: subscription.plan,
          status: subscription.status,
          currentPeriod: {
            start: subscription.currentPeriodStart,
            end: subscription.currentPeriodEnd,
          },
          workspace: subscription.workspace,
          usage: {
            aiMessages: usage?.aiMessageCount ?? 0,
            limit: getAiMessageLimit(subscription.plan),
            periodStart: subscription.currentPeriodStart,
            periodEnd: subscription.currentPeriodEnd,
          },
          createdAt: subscription.createdAt,
          updatedAt: subscription.updatedAt,
        };
      }),
      meta: this.createPaginationMeta(pagination, total),
    };
  }

  private getPagination(query: AdminPaginationQueryDto): Pagination {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_PAGE_SIZE;

    return {
      page,
      limit,
      skip: (page - 1) * limit,
    };
  }

  private createPaginationMeta(
    pagination: Pagination,
    total: number,
  ): PaginationMeta {
    return {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  private createUserSearchWhere(
    search: string | undefined,
  ): Prisma.UserWhereInput {
    if (search === undefined) {
      return {};
    }

    return {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  private createWorkspaceSearchWhere(
    search: string | undefined,
  ): Prisma.WorkspaceWhereInput {
    if (search === undefined) {
      return {};
    }

    return {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        {
          owner: {
            is: {
              email: { contains: search, mode: 'insensitive' },
            },
          },
        },
      ],
    };
  }

  private async getCurrentUsageRecords(
    subscriptions: Prisma.SubscriptionGetPayload<{
      select: typeof adminSubscriptionSelect;
    }>[],
  ) {
    if (subscriptions.length === 0) {
      return new Map<string, { aiMessageCount: number }>();
    }

    const usageRecords = await this.prisma.usageRecord.findMany({
      where: {
        OR: subscriptions.map((subscription) => ({
          workspaceId: subscription.workspaceId,
          periodStart: subscription.currentPeriodStart,
        })),
      },
      select: {
        workspaceId: true,
        periodStart: true,
        aiMessageCount: true,
      },
    });

    return new Map(
      usageRecords.map((usage) => [
        this.getUsageRecordKey(usage.workspaceId, usage.periodStart),
        usage,
      ]),
    );
  }

  private getUsageRecordKey(workspaceId: string, periodStart: Date): string {
    return `${workspaceId}:${periodStart.toISOString()}`;
  }
}
