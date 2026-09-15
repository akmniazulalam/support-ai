import { authenticatedRequest } from '@/lib/api/auth';
import type {
  AdminOverview,
  AdminSubscriptionsQuery,
  AdminSubscriptionsResponse,
  AdminUsersQuery,
  AdminUsersResponse,
  AdminWorkspacesQuery,
  AdminWorkspacesResponse,
} from '@/types/admin';

export async function getAdminOverview(): Promise<AdminOverview> {
  return authenticatedRequest<AdminOverview>('/admin/overview', {
    method: 'GET',
  });
}

export async function getAdminUsers(
  query: AdminUsersQuery = {},
): Promise<AdminUsersResponse> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set('page', String(query.page));
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  if (query.search !== undefined && query.search.trim().length > 0) {
    params.set('search', query.search.trim());
  }

  const queryString = params.toString();
  const path = queryString ? `/admin/users?${queryString}` : '/admin/users';

  return authenticatedRequest<AdminUsersResponse>(path, {
    method: 'GET',
  });
}

export async function getAdminWorkspaces(
  query: AdminWorkspacesQuery = {},
): Promise<AdminWorkspacesResponse> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set('page', String(query.page));
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  if (query.search !== undefined && query.search.trim().length > 0) {
    params.set('search', query.search.trim());
  }

  const queryString = params.toString();
  const path = queryString
    ? `/admin/workspaces?${queryString}`
    : '/admin/workspaces';

  return authenticatedRequest<AdminWorkspacesResponse>(path, {
    method: 'GET',
  });
}

export async function getAdminSubscriptions(
  query: AdminSubscriptionsQuery = {},
): Promise<AdminSubscriptionsResponse> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set('page', String(query.page));
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  if (query.plan !== undefined) params.set('plan', query.plan);
  if (query.status !== undefined) params.set('status', query.status);

  const queryString = params.toString();
  const path = queryString
    ? `/admin/subscriptions?${queryString}`
    : '/admin/subscriptions';

  return authenticatedRequest<AdminSubscriptionsResponse>(path, {
    method: 'GET',
  });
}
