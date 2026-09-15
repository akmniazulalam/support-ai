import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

const transformNumber = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' && value.trim().length > 0 ? Number(value) : value;

export class AdminPaginationQueryDto {
  @Transform(transformNumber)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Transform(transformNumber)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number;
}
