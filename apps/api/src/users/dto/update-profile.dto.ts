import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateProfileDto {
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Matches(/\S/)
  firstName?: string;

  @Transform(trimString)
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Matches(/\S/)
  lastName?: string;
}
