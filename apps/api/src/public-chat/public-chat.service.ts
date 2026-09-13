import { createHash, randomBytes } from 'node:crypto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { KnowledgeContextBuilderService } from '../agent-chat/knowledge-context-builder.service.js';
import {
  AI_PROVIDER,
  type AiProvider,
} from '../ai/providers/ai-provider.interface.js';
import { ConversationHistoryBuilderService } from '../conversations/conversation-history-builder.service.js';
import {
  ConversationsService,
  type PublicMessage,
  publicMessageSelect,
} from '../conversations/conversations.service.js';
import {
  MessageRole,
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

@Injectable()
export class PublicChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationsService: ConversationsService,
    private readonly knowledgeContextBuilder: KnowledgeContextBuilderService,
    private readonly conversationHistoryBuilder: ConversationHistoryBuilderService,
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
      select: { id: true, createdAt: true },
    });

    return { conversation, sessionToken };
  }

  async getConversation(conversationId: string, sessionToken: string) {
    const { conversation } = await this.getConversationAccessOrThrow(
      conversationId,
      sessionToken,
    );
    const messages = await this.prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: publicMessageSelect,
    });

    return {
      conversation: {
        id: conversation.id,
        messages,
      },
    };
  }

  async createMessage(
    conversationId: string,
    dto: CreatePublicMessageDto,
  ): Promise<{ message: PublicMessage }> {
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
    conversationId: string,
    sessionToken: string,
  ): Promise<PublicConversationAccess> {
    const customerSessionTokenHash = this.hashSessionToken(sessionToken);
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        customerSessionTokenHash,
        agent: { isActive: true },
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
}
