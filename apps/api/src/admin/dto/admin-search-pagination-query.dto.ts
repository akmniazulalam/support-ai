import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { AdminPaginationQueryDto } from './admin-pagination-query.dto.js';

const normalizeSearch = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  const search = value.trim();

  return search.length === 0 ? undefined : search;
};

export class AdminSearchPaginationQueryDto extends AdminPaginationQueryDto {
  @Transform(normalizeSearch)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
