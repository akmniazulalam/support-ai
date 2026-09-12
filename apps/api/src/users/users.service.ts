import { Injectable } from '@nestjs/common';
import { Prisma, type User } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

export const publicUserWithWorkspacesSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  createdAt: true,
  updatedAt: true,
  workspaces: {
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.UserSelect;

export const publicUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;

export type PublicUserWithWorkspaces = Prisma.UserGetPayload<{
  select: typeof publicUserWithWorkspacesSelect;
}>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByIdWithWorkspaces(
    id: string,
  ): Promise<PublicUserWithWorkspaces | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicUserWithWorkspacesSelect,
    });
  }

  create(
    prisma: Prisma.TransactionClient,
    data: Pick<User, 'email' | 'passwordHash' | 'firstName' | 'lastName'>,
  ): Promise<User> {
    return prisma.user.create({ data });
  }

  async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  updateProfile(
    userId: string,
    data: Pick<Prisma.UserUpdateInput, 'firstName' | 'lastName'>,
  ): Promise<PublicUser> {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: publicUserSelect,
    });
  }

  async updatePasswordAndClearRefreshToken(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, refreshTokenHash: null },
    });
  }
}
