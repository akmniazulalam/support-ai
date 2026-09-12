import { Inject, Injectable } from '@nestjs/common';
import { AgentsService } from '../agents/agents.service.js';
import {
  AI_PROVIDER,
  type AiProvider,
} from '../ai/providers/ai-provider.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TestChatDto } from './dto/test-chat.dto.js';
import { KnowledgeContextBuilderService } from './knowledge-context-builder.service.js';

@Injectable()
export class AgentChatService {
  constructor(
    private readonly agentsService: AgentsService,
    private readonly prisma: PrismaService,
    private readonly knowledgeContextBuilder: KnowledgeContextBuilderService,
    @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
  ) {}

  async testAgent(
    ownerId: string,
    agentId: string,
    dto: TestChatDto,
  ): Promise<{ answer: string }> {
    const agent = await this.agentsService.getOwnedAgentOrThrow(
      ownerId,
      agentId,
    );
    const knowledgeSources = await this.prisma.knowledgeSource.findMany({
      where: {
        workspaceId: agent.workspaceId,
        agentId: agent.id,
      },
      orderBy: { createdAt: 'asc' },
      select: {
        type: true,
        title: true,
        content: true,
        sourceUrl: true,
      },
    });
    const context = this.knowledgeContextBuilder.build(knowledgeSources);
    const answer = await this.aiProvider.generateResponse(
      agent.instructions ?? '',
      context,
      dto.message,
    );

    return { answer };
  }
}
