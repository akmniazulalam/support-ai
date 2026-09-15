import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma, type Workspace } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SubscriptionService } from '../billing/subscription.service.js';

const MAX_SLUG_GENERATION_ATTEMPTS = 5;

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async createForOwner(
    prisma: Prisma.TransactionClient,
    data: Pick<Workspace, 'name' | 'ownerId'>,
  ): Promise<Workspace> {
    const workspace = await prisma.workspace.create({
      data: {
        ...data,
        slug: this.createUniqueSlug(data.name),
      },
    });

    await this.subscriptionService.ensureDefaultSubscriptionInTransaction(
      prisma,
      workspace.id,
    );

    return workspace;
  }

  async getOwnedWorkspaceOrThrow(ownerId: string): Promise<Workspace> {
    const workspace = await this.prisma.workspace.findFirst({
      where: { ownerId },
      orderBy: { createdAt: 'asc' },
    });

    if (workspace === null) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async updateOwnedWorkspace(
    ownerId: string,
    name: string,
  ): Promise<Workspace> {
    const workspace = await this.getOwnedWorkspaceOrThrow(ownerId);

    if (workspace.name === name) {
      return workspace;
    }

    for (
      let attempt = 0;
      attempt < MAX_SLUG_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      try {
        return await this.prisma.workspace.update({
          where: { id: workspace.id },
          data: { name, slug: this.createUniqueSlug(name) },
        });
      } catch (error) {
        if (
          !this.isSlugConflict(error) ||
          attempt === MAX_SLUG_GENERATION_ATTEMPTS - 1
        ) {
          throw error;
        }
      }
    }

    throw new ConflictException('Unable to create a unique workspace slug');
  }

  private createUniqueSlug(name: string): string {
    const base = name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);

    return `${base || 'workspace'}-${randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }

  private isSlugConflict(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}
