import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, MaxLength, IsPhoneNumber } from 'class-validator';

export class UpdateCustomerProfileDto {
  @ApiPropertyOptional({
    description: 'Customer full name',
    example: 'Ahmed Mohammed Al-Rashid',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Customer phone number with country code',
    example: '+966501234567',
  })
  @IsOptional()
  @IsPhoneNumber('SA') // Saudi Arabia phone format
  phone?: string;

  @ApiPropertyOptional({
    description: 'Customer preferred language',
    example: 'ar',
    enum: ['ar', 'en'],
  })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;
}
