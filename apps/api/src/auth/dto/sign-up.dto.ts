import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator';

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class SignUpDto {
  @Transform(trimString)
  @IsString()
  @Length(1, 100)
  @Matches(/\S/)
  firstName!: string;

  @Transform(trimString)
  @IsString()
  @Length(1, 100)
  @Matches(/\S/)
  lastName!: string;

  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @Length(12, 128)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  password!: string;

  @Transform(trimString)
  @IsString()
  @Length(1, 100)
  @Matches(/\S/)
  workspaceName!: string;
}
