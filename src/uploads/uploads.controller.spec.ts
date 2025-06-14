/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { UserRole, UserStatus } from '../users/enums';

describe('UploadsController', () => {
  let controller: UploadsController;

  const mockUploadsService = {
    uploadProfilePicture: jest.fn(),
    deleteProfilePicture: jest.fn(),
  };

  const mockUsersService = {
    updateProfilePicture: jest.fn(),
  };

  const mockUser: User = {
    id: 'user-123',
    firebaseUid: 'firebase-123',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
    profilePictureUrl: 'https://example.com/old-picture.jpg',
    emailVerified: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UploadsController>(UploadsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadProfilePicture', () => {
    const mockFile: Express.Multer.File = {
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    it('should upload profile picture successfully', async () => {
      const uploadResult = {
        url: 'https://storage.googleapis.com/bucket/new-picture.jpg',
        fileName: 'profiles/user-123/uuid.jpg',
        bucket: 'test-bucket',
      };

      mockUploadsService.uploadProfilePicture.mockResolvedValue(uploadResult);
      mockUsersService.updateProfilePicture.mockResolvedValue(undefined);

      const result = await controller.uploadProfilePicture(mockUser, mockFile);

      expect(result).toEqual({
        url: uploadResult.url,
        message: 'Profile picture uploaded successfully',
      });
      expect(mockUploadsService.uploadProfilePicture).toHaveBeenCalledWith(
        mockFile,
        mockUser.id,
      );
      expect(mockUsersService.updateProfilePicture).toHaveBeenCalledWith(
        mockUser.id,
        uploadResult.url,
      );
    });

    it('should throw BadRequestException when no file is provided', async () => {
      await expect(
        controller.uploadProfilePicture(
          mockUser,
          undefined as unknown as Express.Multer.File,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteProfilePicture', () => {
    it('should delete profile picture successfully', async () => {
      mockUploadsService.deleteProfilePicture.mockResolvedValue(undefined);
      mockUsersService.updateProfilePicture.mockResolvedValue(undefined);

      const result = await controller.deleteProfilePicture(mockUser);

      expect(result).toEqual({
        message: 'Profile picture deleted successfully',
      });
      expect(mockUploadsService.deleteProfilePicture).toHaveBeenCalledWith(
        mockUser.profilePictureUrl,
      );
      expect(mockUsersService.updateProfilePicture).toHaveBeenCalledWith(
        mockUser.id,
        null,
      );
    });

    it('should throw BadRequestException when no profile picture exists', async () => {
      const userWithoutPicture = { ...mockUser, profilePictureUrl: undefined };

      await expect(
        controller.deleteProfilePicture(userWithoutPicture),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
