import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateMessageDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(4_000)
  message!: string;
}
