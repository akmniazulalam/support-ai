import type { SubscriptionPlan, SubscriptionStatus } from './billing';

export interface AdminOverview {
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

export interface AdminPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminUserWorkspaceSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
}

export interface AdminUserWorkspace {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  subscription: AdminUserWorkspaceSubscription | null;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  workspaces: AdminUserWorkspace[];
}

export interface AdminUsersResponse {
  data: AdminUser[];
  meta: AdminPaginationMeta;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AdminWorkspaceOwner {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AdminWorkspaceSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
}

export interface AdminWorkspace {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  owner: AdminWorkspaceOwner;
  subscription: AdminWorkspaceSubscription | null;
  agentCount: number;
  conversationCount: number;
}

export interface AdminWorkspacesResponse {
  data: AdminWorkspace[];
  meta: AdminPaginationMeta;
}

export interface AdminWorkspacesQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AdminSubscriptionWorkspace {
  id: string;
  name: string;
  slug: string;
  owner: AdminWorkspaceOwner;
}

export interface AdminSubscriptionUsage {
  aiMessages: number;
  limit: number;
  periodStart: string;
  periodEnd: string;
}

export interface AdminSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriod: {
    start: string;
    end: string;
  };
  workspace: AdminSubscriptionWorkspace;
  usage: AdminSubscriptionUsage;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSubscriptionsResponse {
  data: AdminSubscription[];
  meta: AdminPaginationMeta;
}

export interface AdminSubscriptionsQuery {
  page?: number;
  limit?: number;
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
}
