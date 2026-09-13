import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ConversationMessagesService } from './conversation-messages.service.js';
import { ConversationsService } from './conversations.service.js';
import { CreateMessageDto } from './dto/create-message.dto.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly conversationMessagesService: ConversationMessagesService,
  ) {}

  @Post('agents/:agentId/conversations')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('agentId') agentId: string,
  ) {
    return this.conversationsService.create(user.userId, agentId);
  }

  @Get('agents/:agentId/conversations')
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('agentId') agentId: string,
  ) {
    return this.conversationsService.list(user.userId, agentId);
  }

  @Get('conversations/:conversationId')
  get(
    @CurrentUser() user: AuthenticatedUser,
    @Param('conversationId') conversationId: string,
  ) {
    return this.conversationsService.getWithMessages(
      user.userId,
      conversationId,
    );
  }

  @Post('conversations/:conversationId/messages')
  @HttpCode(HttpStatus.OK)
  createMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('conversationId') conversationId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.conversationMessagesService.createAssistantResponse(
      user.userId,
      conversationId,
      dto,
    );
  }
}
