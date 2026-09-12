import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { KnowledgeSourceType } from '../../generated/prisma/client.js';

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateKnowledgeSourceDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(KnowledgeSourceType)
  type?: KnowledgeSourceType;

  @ValidateIf((_object, value) => value !== undefined)
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(50_000)
  content?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @Transform(trimString)
  @IsUrl({ require_protocol: true })
  @MaxLength(2_048)
  sourceUrl?: string;
}
