import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, IsPhoneNumber } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Firebase ID token for authentication',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyN...',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Customer full name',
    example: 'Ahmed Mohammed',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'ahmed@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'Customer phone number with country code',
    example: '+966501234567',
  })
  @IsOptional()
  @IsPhoneNumber('SA') // Saudi Arabia phone format, can be made configurable
  phone?: string;

  @ApiPropertyOptional({
    description: 'Customer preferred language',
    example: 'ar',
    enum: ['ar', 'en'],
    default: 'ar',
  })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;
}
