import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma, type Agent } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { WorkspacesService } from '../workspaces/workspaces.service.js';
import { CreateAgentDto } from './dto/create-agent.dto.js';
import { UpdateAgentDto } from './dto/update-agent.dto.js';

const MAX_SLUG_GENERATION_ATTEMPTS = 5;

export const publicAgentSelect = {
  id: true,
  publicId: true,
  name: true,
  slug: true,
  greeting: true,
  instructions: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AgentSelect;

export type PublicAgent = Prisma.AgentGetPayload<{
  select: typeof publicAgentSelect;
}>;

@Injectable()
export class AgentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async create(ownerId: string, dto: CreateAgentDto): Promise<PublicAgent> {
    const workspace =
      await this.workspacesService.getOwnedWorkspaceOrThrow(ownerId);

    for (
      let attempt = 0;
      attempt < MAX_SLUG_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      try {
        return await this.prisma.agent.create({
          data: {
            workspaceId: workspace.id,
            name: dto.name,
            greeting: dto.greeting,
            instructions: dto.instructions,
            isActive: dto.isActive ?? true,
            slug: this.createUniqueSlug(dto.name),
          },
          select: publicAgentSelect,
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

    throw new ConflictException('Unable to create a unique agent slug');
  }

  async list(ownerId: string): Promise<PublicAgent[]> {
    const workspace =
      await this.workspacesService.getOwnedWorkspaceOrThrow(ownerId);

    return this.prisma.agent.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: 'asc' },
      select: publicAgentSelect,
    });
  }

  async get(ownerId: string, agentId: string): Promise<PublicAgent> {
    const agent = await this.getOwnedAgentOrThrow(ownerId, agentId);

    return this.toPublicAgent(agent);
  }

  async update(
    ownerId: string,
    agentId: string,
    dto: UpdateAgentDto,
  ): Promise<PublicAgent> {
    const agent = await this.getOwnedAgentOrThrow(ownerId, agentId);
    const shouldRegenerateSlug =
      dto.name !== undefined && dto.name !== agent.name;

    for (
      let attempt = 0;
      attempt < MAX_SLUG_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      try {
        return await this.prisma.agent.update({
          where: { id: agent.id },
          data: {
            ...(dto.name === undefined ? {} : { name: dto.name }),
            ...(dto.greeting === undefined ? {} : { greeting: dto.greeting }),
            ...(dto.instructions === undefined
              ? {}
              : { instructions: dto.instructions }),
            ...(dto.isActive === undefined ? {} : { isActive: dto.isActive }),
            ...(shouldRegenerateSlug
              ? { slug: this.createUniqueSlug(dto.name as string) }
              : {}),
          },
          select: publicAgentSelect,
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

    throw new ConflictException('Unable to create a unique agent slug');
  }

  async delete(ownerId: string, agentId: string): Promise<{ success: true }> {
    const agent = await this.getOwnedAgentOrThrow(ownerId, agentId);
    await this.prisma.agent.delete({ where: { id: agent.id } });

    return { success: true };
  }

  async getOwnedAgentOrThrow(ownerId: string, agentId: string): Promise<Agent> {
    const workspace =
      await this.workspacesService.getOwnedWorkspaceOrThrow(ownerId);
    const agent = await this.prisma.agent.findFirst({
      where: { id: agentId, workspaceId: workspace.id },
    });

    if (agent === null) {
      throw new NotFoundException('Agent not found');
    }

    return agent;
  }

  private toPublicAgent(agent: Agent): PublicAgent {
    return {
      id: agent.id,
      publicId: agent.publicId,
      name: agent.name,
      slug: agent.slug,
      greeting: agent.greeting,
      instructions: agent.instructions,
      isActive: agent.isActive,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    };
  }

  private createUniqueSlug(name: string): string {
    const base = name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);

    return `${base || 'agent'}-${randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }

  private isSlugConflict(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}
