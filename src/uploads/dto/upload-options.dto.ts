import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class FileValidationOptionsDto {
  @ApiPropertyOptional({
    description: 'Allowed MIME types for the file',
    example: ['image/jpeg', 'image/png'],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  allowedMimeTypes?: string[];

  @ApiPropertyOptional({
    description: 'Maximum file size in bytes',
    example: 10485760, // 10MB
  })
  @IsOptional()
  maxSize?: number;

  @ApiPropertyOptional({
    description: 'Minimum file size in bytes',
    example: 1024, // 1KB
  })
  @IsOptional()
  minSize?: number;
}

export class UploadOptionsDto {
  @ApiProperty({
    description: 'Folder path in the bucket where the file will be stored',
    example: 'profiles',
  })
  @IsString()
  folder: string;

  @ApiPropertyOptional({
    description: 'User ID to organize files by user',
    example: 'user-123',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Custom filename (without extension)',
    example: 'avatar',
  })
  @IsOptional()
  @IsString()
  customFileName?: string;

  @ApiPropertyOptional({
    description: 'Whether to make the file publicly accessible',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  makePublic?: boolean;

  @ApiPropertyOptional({
    description: 'Cache control header for the file',
    example: 'public, max-age=31536000',
    default: 'public, max-age=31536000',
  })
  @IsOptional()
  @IsString()
  cacheControl?: string;

  @ApiPropertyOptional({
    description: 'File validation options',
    type: FileValidationOptionsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FileValidationOptionsDto)
  validation?: FileValidationOptionsDto;
}
