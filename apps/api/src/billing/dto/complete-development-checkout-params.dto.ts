import { IsString, Matches } from 'class-validator';

export class CompleteDevelopmentCheckoutParamsDto {
  @IsString()
  @Matches(/^dev_checkout_[a-f0-9]{32}$/)
  checkoutId!: string;
}
