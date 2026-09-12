import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { Prisma, type User, type Workspace } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  UsersService,
  type PublicUser,
  type PublicUserWithWorkspaces,
} from '../users/users.service.js';
import { WorkspacesService } from '../workspaces/workspaces.service.js';
import * as bcrypt from 'bcryptjs';
import type { JwtPayload, AuthTokens } from './auth.types.js';
import { LoginDto } from './dto/login.dto.js';
import { SignUpDto } from './dto/sign-up.dto.js';
import { ChangePasswordDto } from '../users/dto/change-password.dto.js';

const PASSWORD_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async signUp(dto: SignUpDto) {
    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);

    try {
      const { user, workspace } = await this.prisma.$transaction(async (tx) => {
        const user = await this.usersService.create(tx, {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
        });
        const workspace = await this.workspacesService.createForOwner(tx, {
          name: dto.workspaceName,
          ownerId: user.id,
        });

        return { user, workspace };
      });

      const tokens = await this.issueTokens(user);
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return {
        user: this.toSafeUser(user),
        workspace: this.toBasicWorkspace(workspace),
        ...tokens,
      };
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('An account with this email already exists');
      }

      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    const isPasswordValid =
      user !== null && (await bcrypt.compare(dto.password, user.passwordHash));

    if (!isPasswordValid || user === null) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.issueTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.toSafeUser(user),
      ...tokens,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.usersService.findByIdWithWorkspaces(userId);

    if (user === null) {
      throw new UnauthorizedException('Authentication required');
    }

    return {
      user: this.toSafeUser(user),
      workspaces: user.workspaces,
    };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    const isRefreshTokenValid =
      user !== null &&
      user.refreshTokenHash !== null &&
      (await bcrypt.compare(refreshToken, user.refreshTokenHash));

    if (!isRefreshTokenValid || user === null) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.issueTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    const isCurrentPasswordValid =
      user !== null &&
      (await bcrypt.compare(dto.currentPassword, user.passwordHash));

    if (!isCurrentPasswordValid || user === null) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, PASSWORD_SALT_ROUNDS);
    await this.usersService.updatePasswordAndClearRefreshToken(user.id, passwordHash);

    return { success: true };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshTokenHash(userId, null);

    return { success: true };
  }

  private async issueTokens(user: Pick<User, 'id' | 'email'>): Promise<AuthTokens> {
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tokenType: 'access',
    };
    const refreshPayload: JwtPayload = {
      ...accessPayload,
      tokenType: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.getExpiry('JWT_ACCESS_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.getExpiry('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const refreshTokenHash = await bcrypt.hash(
      refreshToken,
      PASSWORD_SALT_ROUNDS,
    );
    await this.usersService.updateRefreshTokenHash(userId, refreshTokenHash);
  }

  private getExpiry(key: 'JWT_ACCESS_EXPIRES_IN' | 'JWT_REFRESH_EXPIRES_IN') {
    return this.configService.getOrThrow<string>(key) as JwtSignOptions['expiresIn'];
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  private toSafeUser(user: User | PublicUser | PublicUserWithWorkspaces) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toBasicWorkspace(workspace: Workspace) {
    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }
}
