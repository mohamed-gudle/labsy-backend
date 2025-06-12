import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../../users/enums';

export class AuthResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Firebase UID',
    example: 'firebase-uid-12345',
  })
  firebaseUid: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'User status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ApiProperty({
    description: 'Profile picture URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  profilePictureUrl?: string;

  @ApiProperty({
    description: 'Email verification status',
    example: true,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Last login timestamp',
    example: '2025-06-12T10:30:00Z',
    required: false,
  })
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2025-06-01T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-06-12T10:30:00Z',
  })
  updatedAt: Date;
}
