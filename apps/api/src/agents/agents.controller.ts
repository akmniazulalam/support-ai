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
import { CreateAgentDto } from './dto/create-agent.dto.js';
import { UpdateAgentDto } from './dto/update-agent.dto.js';
import { AgentsService } from './agents.service.js';

@Controller('agents')
@UseGuards(JwtAuthGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAgentDto) {
    return this.agentsService.create(user.userId, dto);
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.agentsService.list(user.userId);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') agentId: string) {
    return this.agentsService.get(user.userId, agentId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') agentId: string,
    @Body() dto: UpdateAgentDto,
  ) {
    if (
      dto.name === undefined &&
      dto.greeting === undefined &&
      dto.instructions === undefined &&
      dto.isActive === undefined
    ) {
      throw new BadRequestException('At least one agent field is required');
    }

    return this.agentsService.update(user.userId, agentId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(@CurrentUser() user: AuthenticatedUser, @Param('id') agentId: string) {
    return this.agentsService.delete(user.userId, agentId);
  }
}
