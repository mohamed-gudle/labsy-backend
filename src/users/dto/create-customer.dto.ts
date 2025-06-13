import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsPhoneNumber,
  Matches,
} from 'class-validator';
import { IsValidLanguage } from './validators';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Firebase ID token for authentication',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyN...',
  })
  @IsNotEmpty({ message: 'Firebase token is required' })
  @IsString({ message: 'Token must be a string' })
  token: string;

  @ApiProperty({
    description: 'Customer full name',
    example: 'Ahmed Mohammed',
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  @Matches(/^[a-zA-Z\u0600-\u06FF\s.-]+$/, {
    message:
      'Name can only contain letters, spaces, dots, and hyphens (Arabic and English supported)',
  })
  name: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'ahmed@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiPropertyOptional({
    description: 'Customer phone number with country code',
    example: '+966501234567',
  })
  @IsOptional()
  @IsPhoneNumber('SA', {
    message:
      'Please provide a valid Saudi Arabian phone number with country code (+966)',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Customer preferred language',
    example: 'ar',
    enum: ['ar', 'en'],
    default: 'ar',
  })
  @IsOptional()
  @IsValidLanguage({
    message:
      'Preferred language must be either "ar" (Arabic) or "en" (English)',
  })
  preferredLanguage?: string;
}
