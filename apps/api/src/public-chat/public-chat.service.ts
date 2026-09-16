import { createHash, randomBytes } from 'node:crypto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { KnowledgeContextBuilderService } from '../agent-chat/knowledge-context-builder.service.js';
import {
  AI_PROVIDER,
  type AiProvider,
} from '../ai/providers/ai-provider.interface.js';
import { UsageService } from '../billing/usage.service.js';
import { ConversationHistoryBuilderService } from '../conversations/conversation-history-builder.service.js';
import { ConversationsService } from '../conversations/conversations.service.js';
import {
  MessageRole,
  Prisma,
  type Agent,
  type Conversation,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePublicMessageDto } from './dto/create-public-message.dto.js';

const RECENT_HISTORY_MESSAGE_LIMIT = 12;

interface PublicConversationAccess {
  conversation: Conversation;
  agent: Agent;
}

const publicWidgetMessageSelect = {
  publicId: true,
  role: true,
  content: true,
  createdAt: true,
} satisfies Prisma.MessageSelect;

type PublicWidgetMessageRecord = Prisma.MessageGetPayload<{
  select: typeof publicWidgetMessageSelect;
}>;

export interface PublicWidgetMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

@Injectable()
export class PublicChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationsService: ConversationsService,
    private readonly knowledgeContextBuilder: KnowledgeContextBuilderService,
    private readonly conversationHistoryBuilder: ConversationHistoryBuilderService,
    private readonly usageService: UsageService,
    @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
  ) {}

  async getAgent(publicId: string) {
    const agent = await this.findAvailableAgentOrThrow(publicId);

    return {
      agent: {
        name: agent.name,
        greeting: agent.greeting,
        publicId: agent.publicId,
      },
    };
  }

  async createConversation(publicId: string) {
    const agent = await this.findAvailableAgentOrThrow(publicId);
    const sessionToken = this.createSessionToken();
    const customerSessionTokenHash = this.hashSessionToken(sessionToken);
    const conversation = await this.prisma.conversation.create({
      data: { agentId: agent.id, customerSessionTokenHash },
      select: { publicId: true, createdAt: true },
    });

    return {
      conversation: {
        id: conversation.publicId,
        createdAt: conversation.createdAt,
      },
      sessionToken,
    };
  }

  async getConversation(conversationId: string, sessionToken: string) {
    const { conversation } = await this.getConversationAccessOrThrow(
      conversationId,
      sessionToken,
    );
    const messages = await this.prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: publicWidgetMessageSelect,
    });

    return {
      conversation: {
        id: conversation.publicId,
        messages: messages.map((message) =>
          this.toPublicWidgetMessage(message),
        ),
      },
    };
  }

  async createMessage(
    conversationId: string,
    dto: CreatePublicMessageDto,
  ): Promise<{ message: PublicWidgetMessage }> {
    const { conversation, agent } = await this.getConversationAccessOrThrow(
      conversationId,
      dto.sessionToken,
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
      const publicAssistantMessage =
        await this.prisma.message.findUniqueOrThrow({
          where: { id: assistantMessage.id },
          select: publicWidgetMessageSelect,
        });

      return { message: this.toPublicWidgetMessage(publicAssistantMessage) };
    } catch (error) {
      await this.usageService
        .releaseAiMessageReservation(usageReservation)
        .catch(() => undefined);
      throw error;
    }
  }

  private async findAvailableAgentOrThrow(publicId: string): Promise<Agent> {
    const agent = await this.prisma.agent.findFirst({
      where: { publicId, isActive: true },
    });

    if (agent === null) {
      throw new NotFoundException('Agent not found');
    }

    return agent;
  }

  private async getConversationAccessOrThrow(
    publicConversationId: string,
    sessionToken: string,
  ): Promise<PublicConversationAccess> {
    const customerSessionTokenHash = this.hashSessionToken(sessionToken);
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        customerSessionTokenHash,
        agent: { isActive: true },
        OR: [
          { publicId: publicConversationId },
          // Existing browser sessions may still hold the pre-widget CUID. It is
          // accepted only with the opaque session token and is never returned.
          { id: publicConversationId },
        ],
      },
      include: { agent: true },
    });

    if (conversation === null) {
      throw new NotFoundException('Conversation not found');
    }

    return { conversation, agent: conversation.agent };
  }

  private createSessionToken(): string {
    return randomBytes(32).toString('base64url');
  }

  private hashSessionToken(sessionToken: string): string {
    return createHash('sha256').update(sessionToken).digest('hex');
  }

  private toPublicWidgetMessage(
    message: PublicWidgetMessageRecord,
  ): PublicWidgetMessage {
    return {
      id: message.publicId,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
    };
  }
}
