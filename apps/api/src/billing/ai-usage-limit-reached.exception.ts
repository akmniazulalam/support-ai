import { HttpException, HttpStatus } from '@nestjs/common';
import { SubscriptionPlan } from '../generated/prisma/client.js';

export class AiUsageLimitReachedException extends HttpException {
  constructor(plan: SubscriptionPlan, limit: number, used: number) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        code: 'AI_USAGE_LIMIT_REACHED',
        message: 'Your monthly AI message limit has been reached.',
        limit,
        used,
        plan,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
