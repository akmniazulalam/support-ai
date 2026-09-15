import {
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
import { BillingService } from './billing.service.js';
import { CompleteDevelopmentCheckoutParamsDto } from './dto/complete-development-checkout-params.dto.js';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('subscription')
  getSubscription(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.getSubscription(user.userId);
  }

  @Get('usage')
  getUsage(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.getUsage(user.userId);
  }

  @Post('checkout')
  createProCheckout(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.createProCheckout(user.userId);
  }

  @Post('checkout/:checkoutId/complete')
  @HttpCode(HttpStatus.OK)
  completeCheckout(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: CompleteDevelopmentCheckoutParamsDto,
  ) {
    return this.billingService.completeCheckout(user.userId, params.checkoutId);
  }

  @Post('subscription/cancel')
  @HttpCode(HttpStatus.OK)
  cancelSubscription(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.cancelSubscription(user.userId);
  }
}
