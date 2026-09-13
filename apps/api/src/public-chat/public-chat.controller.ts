import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreatePublicMessageDto } from './dto/create-public-message.dto.js';
import { PublicChatRateLimitGuard } from './public-chat-rate-limit.guard.js';
import { PublicChatService } from './public-chat.service.js';

@Controller('public')
@UseGuards(PublicChatRateLimitGuard)
export class PublicChatController {
  constructor(private readonly publicChatService: PublicChatService) {}

  @Get('agents/:publicId')
  getAgent(@Param('publicId') publicId: string) {
    return this.publicChatService.getAgent(publicId);
  }

  @Post('agents/:publicId/conversations')
  createConversation(@Param('publicId') publicId: string) {
    return this.publicChatService.createConversation(publicId);
  }

  @Get('conversations/:conversationId')
  getConversation(
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string | undefined,
  ) {
    return this.publicChatService.getConversation(
      conversationId,
      this.getBearerTokenOrThrow(authorization),
    );
  }

  @Post('conversations/:conversationId/messages')
  @HttpCode(HttpStatus.OK)
  createMessage(
    @Param('conversationId') conversationId: string,
    @Body() dto: CreatePublicMessageDto,
  ) {
    return this.publicChatService.createMessage(conversationId, dto);
  }

  private getBearerTokenOrThrow(authorization: string | undefined): string {
    const match = /^Bearer\s+(.+)$/.exec(authorization ?? '');

    if (match === null || match[1].length === 0) {
      throw new NotFoundException('Conversation not found');
    }

    return match[1];
  }
}
