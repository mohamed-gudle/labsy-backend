import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, MaxLength, IsPhoneNumber, IsUrl, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateSocialMediaLinksDto {
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

export class UpdateCreatorProfileDto {
  @ApiPropertyOptional({
    description: 'Creator full name',
    example: 'Fatima Al-Zahra Al-Rashid',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Creator phone number with country code',
    example: '+966501234567',
  })
  @IsOptional()
  @IsPhoneNumber('SA') // Saudi Arabia phone format
  phone?: string;

  @ApiPropertyOptional({
    description: 'Business or brand name',
    example: 'Al-Zahra Designs Studio',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  businessName?: string;

  @ApiPropertyOptional({
    description: 'Business description and what the creator offers',
    example: 'Creating unique Arabic calligraphy designs for custom merchandise, home decor, and digital art',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  businessDescription?: string;

  @ApiPropertyOptional({
    description: 'Creator preferred language',
    example: 'ar',
    enum: ['ar', 'en'],
  })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiPropertyOptional({
    description: 'Social media links and online presence',
    type: UpdateSocialMediaLinksDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSocialMediaLinksDto)
  socialMediaLinks?: UpdateSocialMediaLinksDto;

  @ApiPropertyOptional({
    description: 'Product categories the creator specializes in',
    example: ['apparel', 'home-decor', 'accessories', 'digital-art'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];
}
