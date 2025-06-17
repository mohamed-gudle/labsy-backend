import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  url: string;
  fileName: string;
  bucket: string;
}

export interface UploadOptions {
  folder: string;
  userId?: string;
  customFileName?: string;
  makePublic?: boolean;
  cacheControl?: string;
  validation?: FileValidationOptions;
}

export interface FileValidationOptions {
  allowedMimeTypes?: string[];
  maxSize?: number; // in bytes
  minSize?: number; // in bytes
}

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  ANY = 'any',
}

export const FILE_TYPE_CONFIGS: Record<FileType, FileValidationOptions> = {
  [FileType.IMAGE]: {
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  [FileType.DOCUMENT]: {
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSize: 20 * 1024 * 1024, // 20MB
  },
  [FileType.VIDEO]: {
    allowedMimeTypes: ['video/mp4', 'video/mpeg', 'video/quicktime'],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  [FileType.AUDIO]: {
    allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  [FileType.ANY]: {
    maxSize: 100 * 1024 * 1024, // 100MB
  },
};

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly storage: Storage;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName =
      this.configService.get<string>('GOOGLE_CLOUD_STORAGE_BUCKET') ??
      'labsy-uploads';

    // Initialize Google Cloud Storage
    this.storage = new Storage({
      projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
      keyFilename: this.configService.get<string>('GOOGLE_CLOUD_KEY_FILE'),
    });
  }

  /**
   * Generic file upload method to Google Cloud Storage
   */
  async uploadFile(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      // Validate file if validation options are provided
      if (options.validation) {
        this.validateFile(file, options.validation);
      }

      // Generate filename
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      const fileExtension = this.getFileExtension(file.originalname);
      let fileName: string;

      if (options.customFileName) {
        fileName = `${options.folder}/${options.customFileName}.${fileExtension}`;
      } else if (options.userId) {
        fileName = `${options.folder}/${options.userId}/${uuidv4()}.${fileExtension}`;
      } else {
        fileName = `${options.folder}/${uuidv4()}.${fileExtension}`;
      }

      // Get bucket reference
      const bucket = this.storage.bucket(this.bucketName);
      const fileObject = bucket.file(fileName);

      // Create write stream
      const stream = fileObject.createWriteStream({
        metadata: {
          contentType: file.mimetype,
          cacheControl: options.cacheControl ?? 'public, max-age=31536000', // 1 year default
        },
        resumable: false,
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (error: Error) => {
          this.logger.error('Upload failed', error);
          reject(new Error(`Upload failed: ${error.message}`));
        });

        stream.on('finish', () => {
          void (async () => {
            try {
              // Make file publicly readable if specified (default: true)
              if (options.makePublic !== false) {
                await fileObject.makePublic();
              }

              const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;

              this.logger.log(`File uploaded successfully: ${publicUrl}`);

              resolve({
                url: publicUrl,
                fileName,
                bucket: this.bucketName,
              });
            } catch (error) {
              const err = error as Error;
              this.logger.error('Failed to make file public', err);
              reject(new Error(`Failed to make file public: ${err.message}`));
            }
          })();
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        stream.end(file.buffer);
      });
    } catch (error) {
      this.logger.error('Upload service error', error);
      throw error;
    }
  }

  /**
   * Upload a profile picture to Google Cloud Storage
   * @deprecated Use uploadFile with FileType.IMAGE validation instead
   */
  async uploadProfilePicture(
    file: Express.Multer.File,
    userId: string,
  ): Promise<UploadResult> {
    return this.uploadFile(file, {
      folder: 'profiles',
      userId,
      validation: FILE_TYPE_CONFIGS[FileType.IMAGE],
    });
  }

  /**
   * Convenience methods for different file types
   */
  async uploadImage(
    file: Express.Multer.File,
    options: Omit<UploadOptions, 'validation'>,
  ): Promise<UploadResult> {
    return this.uploadFile(file, {
      ...options,
      validation: FILE_TYPE_CONFIGS[FileType.IMAGE],
    });
  }

  async uploadDocument(
    file: Express.Multer.File,
    options: Omit<UploadOptions, 'validation'>,
  ): Promise<UploadResult> {
    return this.uploadFile(file, {
      ...options,
      validation: FILE_TYPE_CONFIGS[FileType.DOCUMENT],
    });
  }

  async uploadVideo(
    file: Express.Multer.File,
    options: Omit<UploadOptions, 'validation'>,
  ): Promise<UploadResult> {
    return this.uploadFile(file, {
      ...options,
      validation: FILE_TYPE_CONFIGS[FileType.VIDEO],
    });
  }

  async uploadAudio(
    file: Express.Multer.File,
    options: Omit<UploadOptions, 'validation'>,
  ): Promise<UploadResult> {
    return this.uploadFile(file, {
      ...options,
      validation: FILE_TYPE_CONFIGS[FileType.AUDIO],
    });
  }

  /**
   * Delete a file from Google Cloud Storage
   */
  async deleteFile(fileName: string): Promise<void> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(fileName);

      const [exists] = await file.exists();
      if (!exists) {
        this.logger.warn(`File not found: ${fileName}`);
        return;
      }

      await file.delete();
      this.logger.log(`File deleted successfully: ${fileName}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to delete file: ${fileName}`, err);
      throw new Error(`Failed to delete file: ${err.message}`);
    }
  }

  /**
   * Delete old profile picture when uploading a new one
   */
  async deleteProfilePicture(profilePictureUrl: string): Promise<void> {
    try {
      if (!profilePictureUrl) {
        return;
      }

      // Extract filename from URL
      const fileName = this.extractFileNameFromUrl(profilePictureUrl);
      if (fileName) {
        await this.deleteFile(fileName);
      }
    } catch (error) {
      this.logger.error('Failed to delete profile picture', error);
      // Don't throw error as this is cleanup operation
    }
  }

  /**
   * Generic file validation method
   */
  private validateFile(
    file: Express.Multer.File,
    validation: FileValidationOptions,
  ): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate MIME type
    if (validation.allowedMimeTypes && validation.allowedMimeTypes.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      if (!validation.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type. Allowed types: ${validation.allowedMimeTypes.join(', ')}`,
        );
      }
    }

    // Validate file size
    if (validation.maxSize && file.size > validation.maxSize) {
      throw new BadRequestException(
        `File size too large. Maximum size: ${validation.maxSize / 1024 / 1024}MB`,
      );
    }

    if (validation.minSize && file.size < validation.minSize) {
      throw new BadRequestException(
        `File size too small. Minimum size: ${validation.minSize / 1024 / 1024}MB`,
      );
    }
  }

  /**
   * Validate image file type and size
   * @deprecated Use validateFile with FileValidationOptions instead
   */
  private validateImageFile(file: Express.Multer.File): void {
    this.validateFile(file, FILE_TYPE_CONFIGS[FileType.IMAGE]);
  }

  /**
   * Extract file extension from filename
   */
  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  }

  /**
   * Extract filename from Google Cloud Storage URL
   */
  private extractFileNameFromUrl(url: string): string | null {
    try {
      const storageBaseUrl = `https://storage.googleapis.com/${this.bucketName}/`;
      if (url.startsWith(storageBaseUrl)) {
        return url.replace(storageBaseUrl, '');
      }
      return null;
    } catch (error) {
      this.logger.error('Failed to extract filename from URL', error);
      return null;
    }
  }
}
