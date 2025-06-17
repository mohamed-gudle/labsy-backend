import {
  Controller,
  Post,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { UploadsService, UploadResult } from './uploads.service';
import { UploadOptionsDto, UploadResultDto } from './dto';

@ApiTags('Uploads')
@Controller('uploads')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file to Google Cloud Storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        options: {
          type: 'object',
          description: 'Upload options',
          properties: {
            folder: {
              type: 'string',
              description: 'Folder path in the bucket',
              example: 'documents',
            },
            userId: {
              type: 'string',
              description: 'User ID (optional)',
              example: 'user-123',
            },
            customFileName: {
              type: 'string',
              description: 'Custom filename without extension (optional)',
              example: 'my-document',
            },
            makePublic: {
              type: 'boolean',
              description: 'Make file publicly accessible (default: true)',
              example: true,
            },
            cacheControl: {
              type: 'string',
              description: 'Cache control header (optional)',
              example: 'public, max-age=31536000',
            },
          },
          required: ['folder'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File uploaded successfully',
    type: UploadResultDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid file or options',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async uploadFile(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body('options') options: UploadOptionsDto,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!options || !options.folder) {
      throw new BadRequestException('Upload options with folder are required');
    }

    try {
      // If no userId provided in options, use current user's ID
      const uploadOptions = {
        ...options,
        userId: options.userId || user.id,
      };

      const uploadResult = await this.uploadsService.uploadFile(
        file,
        uploadOptions,
      );

      return uploadResult;
    } catch (error) {
      const err = error as Error;
      if (
        err.message.includes('Invalid file type') ||
        err.message.includes('File size')
      ) {
        throw new BadRequestException(err.message);
      }
      throw new InternalServerErrorException('Failed to upload file');
    }
  }
}

@Controller('users/profile')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProfileUploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('picture')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture file (JPEG, PNG, WebP, max 10MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile picture uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example:
            'https://storage.googleapis.com/labsy-bucket/profiles/user123/uuid.jpg',
        },
        message: {
          type: 'string',
          example: 'Profile picture uploaded successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid file type or size',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async uploadProfilePicture(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string; message: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // Delete old profile picture if exists
      if (user.profilePictureUrl) {
        await this.uploadsService.deleteProfilePicture(user.profilePictureUrl);
      }

      // Upload new profile picture
      const uploadResult: UploadResult =
        await this.uploadsService.uploadProfilePicture(file, user.id);

      // Update user profile with new picture URL
      await this.usersService.updateProfilePicture(user.id, uploadResult.url);

      return {
        url: uploadResult.url,
        message: 'Profile picture uploaded successfully',
      };
    } catch (error) {
      const err = error as Error;
      if (
        err.message.includes('Invalid file type') ||
        err.message.includes('File size')
      ) {
        throw new BadRequestException(err.message);
      }
      throw new InternalServerErrorException(
        'Failed to upload profile picture',
      );
    }
  }

  @Delete('picture')
  @ApiOperation({ summary: 'Delete profile picture' })
  @ApiResponse({
    status: 200,
    description: 'Profile picture deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Profile picture deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid token',
  })
  @ApiResponse({
    status: 404,
    description: 'No profile picture found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async deleteProfilePicture(
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    if (!user.profilePictureUrl) {
      throw new BadRequestException('No profile picture found');
    }

    try {
      // Delete from Google Cloud Storage
      await this.uploadsService.deleteProfilePicture(user.profilePictureUrl);

      // Update user profile to remove picture URL
      await this.usersService.updateProfilePicture(user.id, null);

      return {
        message: 'Profile picture deleted successfully',
      };
    } catch {
      throw new InternalServerErrorException(
        'Failed to delete profile picture',
      );
    }
  }
}
