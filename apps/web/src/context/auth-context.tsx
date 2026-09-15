'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  getCurrentUser,
  getCurrentWorkspace,
  login as loginApi,
  logout as logoutApi,
  signup as signUpApi,
  updateCurrentUser as updateCurrentUserApi,
  updateCurrentWorkspace as updateCurrentWorkspaceApi,
} from '@/lib/api/auth';
import { getAdminOverview } from '@/lib/api/admin';
import {
  clearStoredTokens,
  getStoredTokens,
  setStoredTokens,
} from '@/lib/auth/auth-storage';
import type {
  BasicWorkspace,
  FullWorkspace,
  LoginDto,
  SafeUser,
  SignUpDto,
  UpdateProfileDto,
} from '@/types/auth';

interface AuthContextValue {
  user: SafeUser | null;
  workspace: FullWorkspace | null;
  workspaces: BasicWorkspace[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (dto: LoginDto) => Promise<void>;
  signup: (dto: SignUpDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateWorkspace: (name: string) => Promise<void>;
  updateProfile: (dto: UpdateProfileDto) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [workspace, setWorkspace] = useState<FullWorkspace | null>(null);
  const [workspaces, setWorkspaces] = useState<BasicWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const isRestoringRef = useRef<boolean>(false);

  // Restore session from client storage
  const restoreSession = useCallback(async () => {
    const tokens = getStoredTokens();
    if (!tokens?.accessToken) {
      setUser(null);
      setWorkspace(null);
      setWorkspaces([]);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      const [userData, workspaceData] = await Promise.all([
        getCurrentUser(),
        getCurrentWorkspace(),
      ]);

      let resolvedAdmin = false;
      try {
        await getAdminOverview();
        resolvedAdmin = true;
      } catch {
        resolvedAdmin = false;
      }

      setIsAdmin(resolvedAdmin);
      setUser({
        ...userData.user,
        role: resolvedAdmin ? 'ADMIN' : 'USER',
      });
      setWorkspaces(userData.workspaces);
      setWorkspace(workspaceData);
    } catch {
      // Tokens invalid or expired and could not refresh
      clearStoredTokens();
      setUser(null);
      setWorkspace(null);
      setWorkspaces([]);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isRestoringRef.current) return;
    isRestoringRef.current = true;
    void restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (dto: LoginDto) => {
    setIsLoading(true);
    try {
      const authRes = await loginApi(dto);
      setStoredTokens({
        accessToken: authRes.accessToken,
        refreshToken: authRes.refreshToken,
      });

      let resolvedAdmin = false;
      try {
        await getAdminOverview();
        resolvedAdmin = true;
      } catch {
        resolvedAdmin = false;
      }

      setIsAdmin(resolvedAdmin);
      setUser({
        ...authRes.user,
        role: resolvedAdmin ? 'ADMIN' : 'USER',
      });

      // Load user's active workspace
      try {
        const workspaceData = await getCurrentWorkspace();
        setWorkspace(workspaceData);
      } catch {
        // Workspace could be loaded later
      }

      // Load workspaces list
      try {
        const userData = await getCurrentUser();
        setWorkspaces(userData.workspaces);
      } catch {
        // Ignore
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (dto: SignUpDto) => {
    setIsLoading(true);
    try {
      const authRes = await signUpApi(dto);
      setStoredTokens({
        accessToken: authRes.accessToken,
        refreshToken: authRes.refreshToken,
      });

      setIsAdmin(false);
      setUser({
        ...authRes.user,
        role: 'USER',
      });
      if (authRes.workspace) {
        setWorkspace({
          ...authRes.workspace,
          ownerId: authRes.user.id,
        });
        setWorkspaces([authRes.workspace]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutApi();
    } finally {
      clearStoredTokens();
      setUser(null);
      setWorkspace(null);
      setWorkspaces([]);
      setIsAdmin(false);
      setIsLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    await restoreSession();
  }, [restoreSession]);

  const updateWorkspace = useCallback(async (name: string) => {
    const updated = await updateCurrentWorkspaceApi({ name });
    setWorkspace(updated);
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === updated.id ? { ...w, name: updated.name, slug: updated.slug } : w)),
    );
  }, []);

  const updateProfile = useCallback(async (dto: UpdateProfileDto) => {
    const updated = await updateCurrentUserApi(dto);
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        workspaces,
        isLoading,
        isAuthenticated: !!user,
        isAdmin,
        login,
        signup,
        logout,
        refreshSession,
        updateWorkspace,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
