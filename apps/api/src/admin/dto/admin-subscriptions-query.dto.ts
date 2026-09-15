import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../generated/prisma/client.js';
import { AdminPaginationQueryDto } from './admin-pagination-query.dto.js';

const normalizeEnumValue = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export class AdminSubscriptionsQueryDto extends AdminPaginationQueryDto {
  @Transform(normalizeEnumValue)
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  plan?: SubscriptionPlan;

  @Transform(normalizeEnumValue)
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;
}
