import { Module } from '@nestjs/common';
import { AgentChatModule } from '../agent-chat/agent-chat.module.js';
import { AiModule } from '../ai/ai.module.js';
import { ConversationsModule } from '../conversations/conversations.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PublicChatController } from './public-chat.controller.js';
import { PublicChatRateLimitGuard } from './public-chat-rate-limit.guard.js';
import { PublicChatService } from './public-chat.service.js';

@Module({
  imports: [AiModule, AgentChatModule, ConversationsModule, PrismaModule],
  controllers: [PublicChatController],
  providers: [PublicChatService, PublicChatRateLimitGuard],
})
export class PublicChatModule {}
