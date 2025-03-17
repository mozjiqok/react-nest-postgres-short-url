import { IsNotEmpty, IsOptional, IsUrl, IsDateString, MaxLength } from 'class-validator';

export class ShortenUrlDto {
  @IsNotEmpty()
  @IsUrl({}, { message: 'Original URL must be a valid URL' })
  originalUrl: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @MaxLength(20, { message: 'Alias must be less than 20 characters' })
  alias?: string;
}