export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface BasicWorkspace {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface FullWorkspace extends BasicWorkspace {
  ownerId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SignUpDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  workspaceName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse extends AuthTokens {
  user: SafeUser;
  workspace?: BasicWorkspace;
}

export interface CurrentUserResponse {
  user: SafeUser;
  workspaces: BasicWorkspace[];
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
}

export interface UpdateWorkspaceDto {
  name: string;
}

export interface PublicAgentInfo {
  id: string;
  publicId: string;
  name: string;
  slug: string;
  greeting: string | null;
  instructions: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
