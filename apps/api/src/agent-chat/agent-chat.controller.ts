import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { TestChatDto } from './dto/test-chat.dto.js';
import { AgentChatService } from './agent-chat.service.js';

@Controller('agents')
@UseGuards(JwtAuthGuard)
export class AgentChatController {
  constructor(private readonly agentChatService: AgentChatService) {}

  @Post(':agentId/test-chat')
  @HttpCode(HttpStatus.OK)
  testAgent(
    @CurrentUser() user: AuthenticatedUser,
    @Param('agentId') agentId: string,
    @Body() dto: TestChatDto,
  ) {
    return this.agentChatService.testAgent(user.userId, agentId, dto);
  }
}
