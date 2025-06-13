import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsPhoneNumber,
  IsUrl,
  ValidateNested,
  IsArray,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  IsValidLanguage,
  IsValidSpecialty,
  IsValidBusinessName,
} from './validators';

class UpdateSocialMediaLinksDto {
  @ApiPropertyOptional({
    description: 'Instagram profile URL',
    example: 'https://instagram.com/labsy_creator',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Instagram URL must be a valid URL' })
  @Matches(/^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/, {
    message: 'Instagram URL must be a valid Instagram profile URL',
  })
  instagram?: string;

  @ApiPropertyOptional({
    description: 'Twitter/X profile URL',
    example: 'https://twitter.com/labsy_creator',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Twitter URL must be a valid URL' })
  @Matches(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/?$/, {
    message: 'Twitter URL must be a valid Twitter/X profile URL',
  })
  twitter?: string;

  @ApiPropertyOptional({
    description: 'TikTok profile URL',
    example: 'https://tiktok.com/@labsy_creator',
  })
  @IsOptional()
  @IsUrl({}, { message: 'TikTok URL must be a valid URL' })
  @Matches(/^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9._]+\/?$/, {
    message: 'TikTok URL must be a valid TikTok profile URL',
  })
  tiktok?: string;

  @ApiPropertyOptional({
    description: 'YouTube channel URL',
    example: 'https://youtube.com/c/labsy_creator',
  })
  @IsOptional()
  @IsUrl({}, { message: 'YouTube URL must be a valid URL' })
  @Matches(
    /^https?:\/\/(www\.)?youtube\.com\/(c\/|channel\/|user\/)?[a-zA-Z0-9._-]+\/?$/,
    {
      message: 'YouTube URL must be a valid YouTube channel URL',
    },
  )
  youtube?: string;

  @ApiPropertyOptional({
    description: 'Website URL',
    example: 'https://labsycreator.com',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Website URL must be a valid URL' })
  website?: string;
}

export class UpdateCreatorProfileDto {
  @ApiPropertyOptional({
    description: 'Creator full name',
    example: 'Fatima Al-Zahra Al-Rashid',
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  @Matches(/^[a-zA-Z\u0600-\u06FF\s.-]+$/, {
    message:
      'Name can only contain letters, spaces, dots, and hyphens (Arabic and English supported)',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Creator phone number with country code',
    example: '+966501234567',
  })
  @IsOptional()
  @IsPhoneNumber('SA', {
    message:
      'Please provide a valid Saudi Arabian phone number with country code (+966)',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Business or brand name',
    example: 'Al-Zahra Designs Studio',
  })
  @IsOptional()
  @IsString({ message: 'Business name must be a string' })
  @MinLength(2, { message: 'Business name must be at least 2 characters long' })
  @MaxLength(150, { message: 'Business name cannot exceed 150 characters' })
  @IsValidBusinessName({
    message:
      'Business name must contain letters or numbers and cannot have excessive special characters',
  })
  businessName?: string;

  @ApiPropertyOptional({
    description: 'Business description and what the creator offers',
    example:
      'Creating unique Arabic calligraphy designs for custom merchandise, home decor, and digital art',
  })
  @IsOptional()
  @IsString({ message: 'Business description must be a string' })
  @MaxLength(500, {
    message: 'Business description cannot exceed 500 characters',
  })
  @MinLength(10, {
    message: 'Business description must be at least 10 characters long',
  })
  businessDescription?: string;

  @ApiPropertyOptional({
    description: 'Creator preferred language',
    example: 'ar',
    enum: ['ar', 'en'],
  })
  @IsOptional()
  @IsValidLanguage({
    message:
      'Preferred language must be either "ar" (Arabic) or "en" (English)',
  })
  preferredLanguage?: string;

  @ApiPropertyOptional({
    description: 'Social media links and online presence',
    type: UpdateSocialMediaLinksDto,
  })
  @IsOptional()
  @ValidateNested({
    message: 'Social media links must be valid URL objects',
  })
  @Type(() => UpdateSocialMediaLinksDto)
  socialMediaLinks?: UpdateSocialMediaLinksDto;

  @ApiPropertyOptional({
    description: 'Product categories the creator specializes in',
    example: ['apparel', 'home-decor', 'accessories', 'digital-art'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Specialties must be an array' })
  @IsValidSpecialty({
    message:
      'All specialties must be from the allowed list: apparel, home-decor, accessories, digital-art, stationery, bags, phone-cases, mugs, posters, canvas, jewelry, electronics, custom-gifts',
  })
  specialties?: string[];
}
