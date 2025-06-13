import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { UserStatus } from '../../users/enums';

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'New user status',
    enum: UserStatus,
    example: UserStatus.SUSPENDED,
  })
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiPropertyOptional({
    description: 'Reason for status change',
    example: 'Account suspended due to policy violation',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the status change',
    example: 'User notified via email. Review scheduled for next week.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
