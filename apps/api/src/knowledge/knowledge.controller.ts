import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateKnowledgeSourceDto } from './dto/create-knowledge-source.dto.js';
import { UpdateKnowledgeSourceDto } from './dto/update-knowledge-source.dto.js';
import { KnowledgeService } from './knowledge.service.js';

@Controller('agents/:agentId/knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('agentId') agentId: string,
    @Body() dto: CreateKnowledgeSourceDto,
  ) {
    return this.knowledgeService.create(user.userId, agentId, dto);
  }

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('agentId') agentId: string,
  ) {
    return this.knowledgeService.list(user.userId, agentId);
  }

  @Get(':knowledgeId')
  get(
    @CurrentUser() user: AuthenticatedUser,
    @Param('agentId') agentId: string,
    @Param('knowledgeId') knowledgeId: string,
  ) {
    return this.knowledgeService.get(user.userId, agentId, knowledgeId);
  }

  @Patch(':knowledgeId')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('agentId') agentId: string,
    @Param('knowledgeId') knowledgeId: string,
    @Body() dto: UpdateKnowledgeSourceDto,
  ) {
    if (
      dto.type === undefined &&
      dto.title === undefined &&
      dto.content === undefined &&
      dto.sourceUrl === undefined
    ) {
      throw new BadRequestException(
        'At least one knowledge source field is required',
      );
    }

    return this.knowledgeService.update(user.userId, agentId, knowledgeId, dto);
  }

  @Delete(':knowledgeId')
  @HttpCode(HttpStatus.OK)
  delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('agentId') agentId: string,
    @Param('knowledgeId') knowledgeId: string,
  ) {
    return this.knowledgeService.delete(user.userId, agentId, knowledgeId);
  }
}
