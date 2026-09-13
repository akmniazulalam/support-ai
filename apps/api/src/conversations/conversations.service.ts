import { Injectable, NotFoundException } from '@nestjs/common';
import {
  MessageRole,
  Prisma,
  type Agent,
  type Conversation,
} from '../generated/prisma/client.js';
import { AgentsService } from '../agents/agents.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

export const publicConversationSelect = {
  id: true,
  agentId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ConversationSelect;

export const publicMessageSelect = {
  id: true,
  role: true,
  content: true,
  createdAt: true,
} satisfies Prisma.MessageSelect;

export type PublicConversation = Prisma.ConversationGetPayload<{
  select: typeof publicConversationSelect;
}>;

export type PublicMessage = Prisma.MessageGetPayload<{
  select: typeof publicMessageSelect;
}>;

export interface OwnedConversation {
  conversation: Conversation;
  agent: Agent;
}

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly agentsService: AgentsService,
  ) {}

  async create(ownerId: string, agentId: string): Promise<PublicConversation> {
    const agent = await this.agentsService.getOwnedAgentOrThrow(
      ownerId,
      agentId,
    );

    return this.prisma.conversation.create({
      data: { agentId: agent.id },
      select: publicConversationSelect,
    });
  }

  async list(ownerId: string, agentId: string): Promise<PublicConversation[]> {
    const agent = await this.agentsService.getOwnedAgentOrThrow(
      ownerId,
      agentId,
    );

    return this.prisma.conversation.findMany({
      where: { agentId: agent.id },
      orderBy: { updatedAt: 'desc' },
      select: publicConversationSelect,
    });
  }

  async getWithMessages(ownerId: string, conversationId: string) {
    const { conversation } = await this.getOwnedConversationOrThrow(
      ownerId,
      conversationId,
    );
    const messages = await this.prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: publicMessageSelect,
    });

    return {
      ...this.toPublicConversation(conversation),
      messages,
    };
  }

  async getOwnedConversationOrThrow(
    ownerId: string,
    conversationId: string,
  ): Promise<OwnedConversation> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (conversation === null) {
      throw new NotFoundException('Conversation not found');
    }

    const agent = await this.agentsService.getOwnedAgentOrThrow(
      ownerId,
      conversation.agentId,
    );

    return { conversation, agent };
  }

  async appendMessage(
    conversationId: string,
    role: MessageRole,
    content: string,
  ): Promise<PublicMessage> {
    return this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: { conversationId, role, content },
        select: publicMessageSelect,
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return message;
    });
  }

  private toPublicConversation(conversation: Conversation): PublicConversation {
    return {
      id: conversation.id,
      agentId: conversation.agentId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }
}
