import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AgentsModule } from '../agents/agents.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { KnowledgeController } from './knowledge.controller.js';
import { KnowledgeService } from './knowledge.service.js';

@Module({
  imports: [
    PrismaModule,
    AgentsModule,
    PassportModule.register({ session: false }),
  ],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
})
export class KnowledgeModule {}
