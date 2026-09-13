import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AgentChatModule } from '../agent-chat/agent-chat.module.js';
import { AgentsModule } from '../agents/agents.module.js';
import { AiModule } from '../ai/ai.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ConversationHistoryBuilderService } from './conversation-history-builder.service.js';
import { ConversationMessagesService } from './conversation-messages.service.js';
import { ConversationsController } from './conversations.controller.js';
import { ConversationsService } from './conversations.service.js';

@Module({
  imports: [
    AiModule,
    AgentChatModule,
    AgentsModule,
    PrismaModule,
    PassportModule.register({ session: false }),
  ],
  controllers: [ConversationsController],
  providers: [
    ConversationsService,
    ConversationMessagesService,
    ConversationHistoryBuilderService,
  ],
  exports: [ConversationsService, ConversationHistoryBuilderService],
})
export class ConversationsModule {}
