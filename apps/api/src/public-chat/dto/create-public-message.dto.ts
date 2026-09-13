import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

const trimMessage = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreatePublicMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  sessionToken!: string;

  @Transform(trimMessage)
  @IsString()
  @MinLength(1)
  @MaxLength(4_000)
  message!: string;
}
