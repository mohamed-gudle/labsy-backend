/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { VerifyTokenDto } from './dto';
import { UserRole, UserStatus } from '../users/enums';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = {
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
      expect(result).toEqual({
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
      });
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
  });

  describe('getCurrentUser', () => {
    it('should return current user when valid authorization header provided', async () => {
      const authorization = 'Bearer valid-firebase-token';

      mockAuthService.verifyTokenAndSyncUser.mockResolvedValue(mockUser);

      const result = await controller.getCurrentUser(authorization);

      expect(authService.verifyTokenAndSyncUser).toHaveBeenCalledWith(
        'valid-firebase-token',
      );
      expect(result).toEqual({
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
      });
    });

    it('should throw UnauthorizedException when authorization header is missing', async () => {
      await expect(controller.getCurrentUser()).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.getCurrentUser()).rejects.toThrow(
        'Authorization header is required',
      );

      expect(authService.verifyTokenAndSyncUser).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authorization header is empty', async () => {
      await expect(controller.getCurrentUser('')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.getCurrentUser('')).rejects.toThrow(
        'Authorization header is required',
      );

      expect(authService.verifyTokenAndSyncUser).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authorization header format is invalid', async () => {
      const invalidHeaders = [
        'invalid-format',
        'Bearer',
        'Bearer ',
        'Basic valid-token',
      ];

      for (const header of invalidHeaders) {
        await expect(controller.getCurrentUser(header)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(controller.getCurrentUser(header)).rejects.toThrow(
          'Invalid authorization header format',
        );
      }

      expect(authService.verifyTokenAndSyncUser).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token verification fails', async () => {
      const authorization = 'Bearer invalid-token';

      mockAuthService.verifyTokenAndSyncUser.mockRejectedValue(
        new UnauthorizedException('Invalid or expired token'),
      );

      await expect(controller.getCurrentUser(authorization)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(authService.verifyTokenAndSyncUser).toHaveBeenCalledWith(
        'invalid-token',
      );
    });

    it('should handle token extraction correctly', async () => {
      const testCases = [
        {
          authorization: 'Bearer token123',
          expectedToken: 'token123',
        },
        {
          authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyN...',
          expectedToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyN...',
        },
        {
          authorization: 'Bearer token-with-dashes',
          expectedToken: 'token-with-dashes',
        },
      ];

      mockAuthService.verifyTokenAndSyncUser.mockResolvedValue(mockUser);

      for (const testCase of testCases) {
        await controller.getCurrentUser(testCase.authorization);
        expect(authService.verifyTokenAndSyncUser).toHaveBeenCalledWith(
          testCase.expectedToken,
        );
      }
    });
  });
});
