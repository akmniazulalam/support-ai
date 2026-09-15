import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AgentChatModule } from './agent-chat/agent-chat.module.js';
import { AgentsModule } from './agents/agents.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BillingModule } from './billing/billing.module.js';
import { ConversationsModule } from './conversations/conversations.module.js';
import { HealthModule } from './health/health.module.js';
import { KnowledgeModule } from './knowledge/knowledge.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { PublicChatModule } from './public-chat/public-chat.module.js';
import { UsersModule } from './users/users.module.js';
import { WorkspacesModule } from './workspaces/workspaces.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    BillingModule,
    UsersModule,
    WorkspacesModule,
    AgentsModule,
    KnowledgeModule,
    AgentChatModule,
    ConversationsModule,
    PublicChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
