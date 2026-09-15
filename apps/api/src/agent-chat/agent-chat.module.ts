import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AgentsModule } from '../agents/agents.module.js';
import { AiModule } from '../ai/ai.module.js';
import { UsageModule } from '../billing/usage.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AgentChatController } from './agent-chat.controller.js';
import { AgentChatService } from './agent-chat.service.js';
import { KnowledgeContextBuilderService } from './knowledge-context-builder.service.js';

@Module({
  imports: [
    AiModule,
    UsageModule,
    AgentsModule,
    PrismaModule,
    PassportModule.register({ session: false }),
  ],
  controllers: [AgentChatController],
  providers: [AgentChatService, KnowledgeContextBuilderService],
  exports: [KnowledgeContextBuilderService],
})
export class AgentChatModule {}
