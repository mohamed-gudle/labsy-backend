import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, IsPhoneNumber, IsUrl, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class SocialMediaLinksDto {
  @ApiPropertyOptional({
    description: 'Instagram profile URL',
    example: 'https://instagram.com/labsy_creator',
  })
  @IsOptional()
  @IsUrl()
  instagram?: string;

  @ApiPropertyOptional({
    description: 'Twitter/X profile URL',
    example: 'https://twitter.com/labsy_creator',
  })
  @IsOptional()
  @IsUrl()
  twitter?: string;

  @ApiPropertyOptional({
    description: 'TikTok profile URL',
    example: 'https://tiktok.com/@labsy_creator',
  })
  @IsOptional()
  @IsUrl()
  tiktok?: string;

  @ApiPropertyOptional({
    description: 'YouTube channel URL',
    example: 'https://youtube.com/c/labsy_creator',
  })
  @IsOptional()
  @IsUrl()
  youtube?: string;

  @ApiPropertyOptional({
    description: 'Website URL',
    example: 'https://labsycreator.com',
  })
  @IsOptional()
  @IsUrl()
  website?: string;
}

export class CreateCreatorDto {
  @ApiProperty({
    description: 'Firebase ID token for authentication',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyN...',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Creator full name',
    example: 'Fatima Al-Zahra',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Creator email address',
    example: 'fatima@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'Creator phone number with country code',
    example: '+966501234567',
  })
  @IsOptional()
  @IsPhoneNumber('SA') // Saudi Arabia phone format
  phone?: string;

  @ApiProperty({
    description: 'Business or brand name',
    example: 'Al-Zahra Designs',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  businessName: string;

  @ApiPropertyOptional({
    description: 'Business description and what the creator offers',
    example: 'Creating unique Arabic calligraphy designs for custom merchandise and home decor',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  businessDescription?: string;

  @ApiPropertyOptional({
    description: 'Creator preferred language',
    example: 'ar',
    enum: ['ar', 'en'],
    default: 'ar',
  })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiPropertyOptional({
    description: 'Social media links and online presence',
    type: SocialMediaLinksDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialMediaLinksDto)
  socialMediaLinks?: SocialMediaLinksDto;

  @ApiPropertyOptional({
    description: 'Product categories the creator specializes in',
    example: ['apparel', 'home-decor', 'accessories'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];
}
