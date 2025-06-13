/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { VerifyTokenDto } from './dto';
import { UserRole, UserStatus } from '../users/enums';
import { User } from '../users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    firebaseUid: 'firebase-uid-123',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
    profilePictureUrl: 'https://example.com/avatar.jpg',
    emailVerified: true,
    lastLoginAt: new Date('2025-06-12T10:30:00Z'),
    createdAt: new Date('2025-06-01T10:30:00Z'),
    updatedAt: new Date('2025-06-12T10:30:00Z'),
    deletedAt: undefined,
  } as User;

  const expectedAuthResponse = {
    id: mockUser.id,
    firebaseUid: mockUser.firebaseUid,
    email: mockUser.email,
    name: mockUser.name,
    role: mockUser.role,
    status: mockUser.status,
    profilePictureUrl: mockUser.profilePictureUrl,
    emailVerified: mockUser.emailVerified,
    lastLoginAt: mockUser.lastLoginAt,
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt,
  };

  const mockAuthService = {
    verifyTokenAndSyncUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('verifyToken', () => {
    it('should verify token and return user data', async () => {
      const verifyTokenDto: VerifyTokenDto = {
        token: 'valid-firebase-token',
      };

      mockAuthService.verifyTokenAndSyncUser.mockResolvedValue(mockUser);

      const result = await controller.verifyToken(verifyTokenDto);

      expect(authService.verifyTokenAndSyncUser).toHaveBeenCalledWith(
        'valid-firebase-token',
      );
      expect(result).toEqual(expectedAuthResponse);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const verifyTokenDto: VerifyTokenDto = {
        token: 'invalid-token',
      };

      mockAuthService.verifyTokenAndSyncUser.mockRejectedValue(
        new UnauthorizedException('Invalid or expired token'),
      );

      await expect(controller.verifyToken(verifyTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(authService.verifyTokenAndSyncUser).toHaveBeenCalledWith(
        'invalid-token',
      );
    });

    it('should handle missing token in request body', async () => {
      const verifyTokenDto: VerifyTokenDto = {
        token: '',
      };

      mockAuthService.verifyTokenAndSyncUser.mockRejectedValue(
        new UnauthorizedException('Invalid or expired token'),
      );

      await expect(controller.verifyToken(verifyTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(authService.verifyTokenAndSyncUser).toHaveBeenCalledWith('');
    });

    it('should handle service errors gracefully', async () => {
      const verifyTokenDto: VerifyTokenDto = {
        token: 'valid-token',
      };

      mockAuthService.verifyTokenAndSyncUser.mockRejectedValue(
        new Error('Internal server error'),
      );

      await expect(controller.verifyToken(verifyTokenDto)).rejects.toThrow(
        'Internal server error',
      );

      expect(authService.verifyTokenAndSyncUser).toHaveBeenCalledWith(
        'valid-token',
      );
    });

    it('should return all required user fields', async () => {
      const verifyTokenDto: VerifyTokenDto = {
        token: 'valid-token',
      };

      mockAuthService.verifyTokenAndSyncUser.mockResolvedValue(mockUser);

      const result = await controller.verifyToken(verifyTokenDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('firebaseUid');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('profilePictureUrl');
      expect(result).toHaveProperty('emailVerified');
      expect(result).toHaveProperty('lastLoginAt');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user data', () => {
      const result = controller.getCurrentUser(mockUser);

      expect(result).toEqual(expectedAuthResponse);
    });

    it('should return all required user fields', () => {
      const result = controller.getCurrentUser(mockUser);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('firebaseUid');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('profilePictureUrl');
      expect(result).toHaveProperty('emailVerified');
      expect(result).toHaveProperty('lastLoginAt');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should handle user with null values', () => {
      const userWithNulls: User = {
        ...mockUser,
        profilePictureUrl: undefined,
        lastLoginAt: undefined,
      } as User;

      const result = controller.getCurrentUser(userWithNulls);

      expect(result.profilePictureUrl).toBeUndefined();
      expect(result.lastLoginAt).toBeUndefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });

    it('should handle different user roles', () => {
      const roles = [
        UserRole.CUSTOMER,
        UserRole.CREATOR,
        UserRole.FACTORY,
        UserRole.ADMIN,
      ];

      roles.forEach((role) => {
        const userWithRole: User = {
          ...mockUser,
          role,
        } as User;

        const result = controller.getCurrentUser(userWithRole);

        expect(result.role).toBe(role);
      });
    });

    it('should handle different user statuses', () => {
      const statuses = [
        UserStatus.ACTIVE,
        UserStatus.SUSPENDED,
        UserStatus.DELETED,
      ];

      statuses.forEach((status) => {
        const userWithStatus: User = {
          ...mockUser,
          status,
        } as User;

        const result = controller.getCurrentUser(userWithStatus);

        expect(result.status).toBe(status);
      });
    });
  });
});
