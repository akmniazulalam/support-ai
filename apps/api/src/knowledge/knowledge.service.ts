import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  KnowledgeSourceType,
  Prisma,
  type Agent,
  type KnowledgeSource,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AgentsService } from '../agents/agents.service.js';
import { CreateKnowledgeSourceDto } from './dto/create-knowledge-source.dto.js';
import { UpdateKnowledgeSourceDto } from './dto/update-knowledge-source.dto.js';

export const publicKnowledgeSourceSelect = {
  id: true,
  agentId: true,
  type: true,
  title: true,
  content: true,
  sourceUrl: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.KnowledgeSourceSelect;

export type PublicKnowledgeSource = Prisma.KnowledgeSourceGetPayload<{
  select: typeof publicKnowledgeSourceSelect;
}>;

@Injectable()
export class KnowledgeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly agentsService: AgentsService,
  ) {}

  async create(
    ownerId: string,
    agentId: string,
    dto: CreateKnowledgeSourceDto,
  ): Promise<PublicKnowledgeSource> {
    const agent = await this.agentsService.getOwnedAgentOrThrow(
      ownerId,
      agentId,
    );
    this.assertTypeRequirements(dto.type, dto.content, dto.sourceUrl);

    return this.prisma.knowledgeSource.create({
      data: {
        workspaceId: agent.workspaceId,
        agentId: agent.id,
        type: dto.type,
        title: dto.title,
        content: dto.content,
        sourceUrl: dto.sourceUrl,
      },
      select: publicKnowledgeSourceSelect,
    });
  }

  async list(
    ownerId: string,
    agentId: string,
  ): Promise<PublicKnowledgeSource[]> {
    const agent = await this.agentsService.getOwnedAgentOrThrow(
      ownerId,
      agentId,
    );

    return this.prisma.knowledgeSource.findMany({
      where: { agentId: agent.id, workspaceId: agent.workspaceId },
      orderBy: { createdAt: 'asc' },
      select: publicKnowledgeSourceSelect,
    });
  }

  async get(
    ownerId: string,
    agentId: string,
    knowledgeId: string,
  ): Promise<PublicKnowledgeSource> {
    const agent = await this.agentsService.getOwnedAgentOrThrow(
      ownerId,
      agentId,
    );
    const knowledgeSource = await this.getOwnedKnowledgeSourceOrThrow(
      agent,
      knowledgeId,
    );

    return this.toPublicKnowledgeSource(knowledgeSource);
  }

  async update(
    ownerId: string,
    agentId: string,
    knowledgeId: string,
    dto: UpdateKnowledgeSourceDto,
  ): Promise<PublicKnowledgeSource> {
    const agent = await this.agentsService.getOwnedAgentOrThrow(
      ownerId,
      agentId,
    );
    const knowledgeSource = await this.getOwnedKnowledgeSourceOrThrow(
      agent,
      knowledgeId,
    );
    const type = dto.type ?? knowledgeSource.type;
    const content = dto.content ?? knowledgeSource.content;
    const sourceUrl = dto.sourceUrl ?? knowledgeSource.sourceUrl;

    this.assertTypeRequirements(type, content, sourceUrl);

    return this.prisma.knowledgeSource.update({
      where: { id: knowledgeSource.id },
      data: {
        ...(dto.type === undefined ? {} : { type: dto.type }),
        ...(dto.title === undefined ? {} : { title: dto.title }),
        ...(dto.content === undefined ? {} : { content: dto.content }),
        ...(dto.sourceUrl === undefined ? {} : { sourceUrl: dto.sourceUrl }),
      },
      select: publicKnowledgeSourceSelect,
    });
  }

  async delete(
    ownerId: string,
    agentId: string,
    knowledgeId: string,
  ): Promise<{ success: true }> {
    const agent = await this.agentsService.getOwnedAgentOrThrow(
      ownerId,
      agentId,
    );
    const knowledgeSource = await this.getOwnedKnowledgeSourceOrThrow(
      agent,
      knowledgeId,
    );
    await this.prisma.knowledgeSource.delete({
      where: { id: knowledgeSource.id },
    });

    return { success: true };
  }

  private async getOwnedKnowledgeSourceOrThrow(
    agent: Agent,
    knowledgeId: string,
  ): Promise<KnowledgeSource> {
    const knowledgeSource = await this.prisma.knowledgeSource.findFirst({
      where: {
        id: knowledgeId,
        agentId: agent.id,
        workspaceId: agent.workspaceId,
      },
    });

    if (knowledgeSource === null) {
      throw new NotFoundException('Knowledge source not found');
    }

    return knowledgeSource;
  }

  private assertTypeRequirements(
    type: KnowledgeSourceType,
    content: string | null | undefined,
    sourceUrl: string | null | undefined,
  ): void {
    if (
      (type === KnowledgeSourceType.TEXT || type === KnowledgeSourceType.FAQ) &&
      (content === null || content === undefined || content.trim().length === 0)
    ) {
      throw new BadRequestException(
        'Content is required for TEXT and FAQ sources',
      );
    }

    if (
      type === KnowledgeSourceType.WEBSITE &&
      (sourceUrl === null || sourceUrl === undefined || sourceUrl.length === 0)
    ) {
      throw new BadRequestException(
        'Source URL is required for WEBSITE sources',
      );
    }
  }

  private toPublicKnowledgeSource(
    knowledgeSource: KnowledgeSource,
  ): PublicKnowledgeSource {
    return {
      id: knowledgeSource.id,
      agentId: knowledgeSource.agentId,
      type: knowledgeSource.type,
      title: knowledgeSource.title,
      content: knowledgeSource.content,
      sourceUrl: knowledgeSource.sourceUrl,
      createdAt: knowledgeSource.createdAt,
      updatedAt: knowledgeSource.updatedAt,
    };
  }
}
