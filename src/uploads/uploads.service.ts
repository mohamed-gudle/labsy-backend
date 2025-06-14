/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  url: string;
  fileName: string;
  bucket: string;
}

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
   * Upload a profile picture to Google Cloud Storage
   */
  async uploadProfilePicture(
    file: Express.Multer.File,
    userId: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      // Validate file type
      this.validateImageFile(file);

      // Generate unique filename
      const fileExtension = this.getFileExtension(file.originalname);
      const fileName = `profiles/${userId}/${uuidv4()}.${fileExtension}`;

      // Get bucket reference
      const bucket = this.storage.bucket(this.bucketName);
      const fileObject = bucket.file(fileName);

      // Create write stream
      const stream = fileObject.createWriteStream({
        metadata: {
          contentType: file.mimetype,
          cacheControl: 'public, max-age=31536000', // 1 year
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
              // Make file publicly readable
              await fileObject.makePublic();

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

        stream.end(file.buffer);
      });
    } catch (error) {
      this.logger.error('Upload service error', error);
      throw error;
    }
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
   * Validate image file type and size
   */
  private validateImageFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
      );
    }
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
