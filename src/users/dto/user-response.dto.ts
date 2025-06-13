import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../enums';

export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Firebase user identifier',
    example: 'firebase-uid-123',
  })
  firebaseUid: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'Ahmed Mohammed',
  })
  name: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'User account status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ApiPropertyOptional({
    description: 'Profile picture URL',
    example: 'https://storage.googleapis.com/labsy-bucket/profiles/user123.jpg',
  })
  profilePictureUrl?: string;

  @ApiProperty({
    description: 'Whether the user email is verified',
    example: true,
  })
  emailVerified: boolean;

  @ApiPropertyOptional({
    description: 'Last login timestamp',
    example: '2025-06-13T10:30:00Z',
  })
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2025-06-01T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Account last update timestamp',
    example: '2025-06-13T10:30:00Z',
  })
  updatedAt: Date;
}

export class CustomerResponseDto extends UserResponseDto {
  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '+966501234567',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Customer preferred language',
    example: 'ar',
  })
  preferredLanguage?: string;

  @ApiPropertyOptional({
    description: 'Customer shipping addresses',
    example: [],
    type: 'array',
  })
  shippingAddresses?: any[]; // TODO: Define shipping address type when implemented

  @ApiPropertyOptional({
    description: 'Profile completion percentage',
    example: 75,
    minimum: 0,
    maximum: 100,
  })
  profileCompletion?: number;
}

class SocialMediaLinksResponseDto {
  @ApiPropertyOptional({
    description: 'Instagram profile URL',
    example: 'https://instagram.com/labsy_creator',
  })
  instagram?: string;

  @ApiPropertyOptional({
    description: 'Twitter/X profile URL',
    example: 'https://twitter.com/labsy_creator',
  })
  twitter?: string;

  @ApiPropertyOptional({
    description: 'TikTok profile URL',
    example: 'https://tiktok.com/@labsy_creator',
  })
  tiktok?: string;

  @ApiPropertyOptional({
    description: 'YouTube channel URL',
    example: 'https://youtube.com/c/labsy_creator',
  })
  youtube?: string;

  @ApiPropertyOptional({
    description: 'Website URL',
    example: 'https://labsycreator.com',
  })
  website?: string;
}

export class CreatorResponseDto extends UserResponseDto {
  @ApiPropertyOptional({
    description: 'Creator phone number',
    example: '+966501234567',
  })
  phone?: string;

  @ApiProperty({
    description: 'Business or brand name',
    example: 'Al-Zahra Designs',
  })
  businessName: string;

  @ApiPropertyOptional({
    description: 'Business description',
    example:
      'Creating unique Arabic calligraphy designs for custom merchandise',
  })
  businessDescription?: string;

  @ApiPropertyOptional({
    description: 'Creator preferred language',
    example: 'ar',
  })
  preferredLanguage?: string;

  @ApiPropertyOptional({
    description: 'Social media links and online presence',
    type: SocialMediaLinksResponseDto,
  })
  socialMediaLinks?: SocialMediaLinksResponseDto;

  @ApiPropertyOptional({
    description: 'Product categories the creator specializes in',
    example: ['apparel', 'home-decor', 'accessories'],
    type: [String],
  })
  specialties?: string[];

  @ApiPropertyOptional({
    description: 'Profile completion percentage',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  profileCompletion?: number;

  @ApiPropertyOptional({
    description: 'Creator verification status',
    example: false,
  })
  isVerified?: boolean;
}

export class FactoryResponseDto extends UserResponseDto {
  @ApiPropertyOptional({
    description: 'Factory location information',
    example: { city: 'Riyadh', country: 'Saudi Arabia' },
  })
  location?: any; // TODO: Define location type when implemented

  @ApiPropertyOptional({
    description: 'Factory production capabilities',
    example: ['printing', 'embroidery', 'custom-cutting'],
    type: [String],
  })
  capabilities?: string[];

  @ApiPropertyOptional({
    description: 'Profile completion percentage',
    example: 90,
    minimum: 0,
    maximum: 100,
  })
  profileCompletion?: number;

  @ApiPropertyOptional({
    description: 'Factory verification status',
    example: true,
  })
  isVerified?: boolean;
}

export class AdminResponseDto extends UserResponseDto {
  @ApiPropertyOptional({
    description: 'Admin permissions level',
    example: 'super-admin',
  })
  permissions?: string;

  @ApiPropertyOptional({
    description: 'Last admin action timestamp',
    example: '2025-06-13T09:15:00Z',
  })
  lastActionAt?: Date;
}
