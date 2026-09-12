import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UsersService } from './users.service.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Patch('me')
  updateCurrentUser(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    if (dto.firstName === undefined && dto.lastName === undefined) {
      throw new BadRequestException('At least one profile field is required');
    }

    return this.usersService.updateProfile(user.userId, {
      ...(dto.firstName === undefined ? {} : { firstName: dto.firstName }),
      ...(dto.lastName === undefined ? {} : { lastName: dto.lastName }),
    });
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.userId, dto);
  }
}
