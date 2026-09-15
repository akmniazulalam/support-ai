import { Inject, Injectable } from '@nestjs/common';
import { KnowledgeContextBuilderService } from '../agent-chat/knowledge-context-builder.service.js';
import {
  AI_PROVIDER,
  type AiProvider,
} from '../ai/providers/ai-provider.interface.js';
import { UsageService } from '../billing/usage.service.js';
import { MessageRole } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConversationHistoryBuilderService } from './conversation-history-builder.service.js';
import {
  ConversationsService,
  type PublicMessage,
} from './conversations.service.js';
import { CreateMessageDto } from './dto/create-message.dto.js';

const RECENT_HISTORY_MESSAGE_LIMIT = 12;

@Injectable()
export class ConversationMessagesService {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly prisma: PrismaService,
    private readonly knowledgeContextBuilder: KnowledgeContextBuilderService,
    private readonly conversationHistoryBuilder: ConversationHistoryBuilderService,
    private readonly usageService: UsageService,
    @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
  ) {}

  async createAssistantResponse(
    ownerId: string,
    conversationId: string,
    dto: CreateMessageDto,
  ): Promise<{ message: PublicMessage }> {
    const { conversation, agent } =
      await this.conversationsService.getOwnedConversationOrThrow(
        ownerId,
        conversationId,
      );
    const [knowledgeSources, history] = await Promise.all([
      this.prisma.knowledgeSource.findMany({
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
      }),
      this.prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: RECENT_HISTORY_MESSAGE_LIMIT,
        select: {
          role: true,
          content: true,
        },
      }),
    ]);
    const knowledgeContext =
      this.knowledgeContextBuilder.build(knowledgeSources);
    const conversationHistory = this.conversationHistoryBuilder.build(
      history.reverse(),
    );

    const usageReservation = await this.usageService.reserveAiMessage(
      agent.workspaceId,
    );

    try {
      await this.conversationsService.appendMessage(
        conversation.id,
        MessageRole.USER,
        dto.message,
      );

      const answer = await this.aiProvider.generateResponse(
        agent.instructions ?? '',
        knowledgeContext,
        dto.message,
        conversationHistory,
      );
      const assistantMessage = await this.conversationsService.appendMessage(
        conversation.id,
        MessageRole.ASSISTANT,
        answer,
      );

      return { message: assistantMessage };
    } catch (error) {
      await this.usageService
        .releaseAiMessageReservation(usageReservation)
        .catch(() => undefined);
      throw error;
    }
  }
}
