import { describe, expect, it, vi } from 'vitest';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service.js';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { UsersService } from '../users/users.service.js';
import type { WorkspacesService } from '../workspaces/workspaces.service.js';

const TOO_LONG_PASSWORD = `ValidPassword1${'x'.repeat(60)}`;

function createAuthService(usersService = {} as UsersService): AuthService {
  return new AuthService(
    {} as ConfigService,
    {} as JwtService,
    {} as PrismaService,
    usersService,
    {} as WorkspacesService,
  );
}

describe('AuthService password length protection', () => {
  it('rejects a signup password that bcrypt would truncate', async () => {
    const service = createAuthService();

    expect(bcrypt.truncates(TOO_LONG_PASSWORD)).toBe(true);
    await expect(
      service.signUp({
        firstName: 'Password',
        lastName: 'Test',
        email: 'password-test@example.invalid',
        password: TOO_LONG_PASSWORD,
        workspaceName: 'Password Test',
      }),
    ).rejects.toThrow('Password must be at most 72 bytes');
  });

  it('rejects an overlong replacement password before hashing or persisting it', async () => {
    const passwordHash = await bcrypt.hash('CurrentPassword1', 4);
    const updatePasswordAndClearRefreshToken = vi.fn();
    const usersService = {
      findById: vi.fn().mockResolvedValue({
        id: 'user-1',
        passwordHash,
      }),
      updatePasswordAndClearRefreshToken,
    } as unknown as UsersService;
    const service = createAuthService(usersService);

    await expect(
      service.changePassword('user-1', {
        currentPassword: 'CurrentPassword1',
        newPassword: TOO_LONG_PASSWORD,
      }),
    ).rejects.toThrow('Password must be at most 72 bytes');

    expect(updatePasswordAndClearRefreshToken).not.toHaveBeenCalled();
  });
});
