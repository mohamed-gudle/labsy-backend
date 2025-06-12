import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService, FirebaseUser } from './auth.service';
import { User } from '../users/entities';
import { UserRole, UserStatus } from '../users/enums';
import * as admin from 'firebase-admin';

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn().mockReturnValue({
      // Mock credential object
      type: 'service_account',
      project_id: 'test-project',
      client_email: 'test@test-project.iam.gserviceaccount.com',
    }),
  },
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
    getUser: jest.fn(),
  })),
}));

describe('AuthService', () => {
  let service: AuthService;
  let configService: ConfigService;
  let userRepository: Repository<User>;
  let mockFirebaseAuth: any;

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
  };

  const mockFirebaseUser: FirebaseUser = {
    uid: 'firebase-uid-123',
    email: 'test@example.com',
    emailVerified: true,
    name: 'Test User',
    picture: 'https://example.com/avatar.jpg',
  };

  const mockDecodedToken = {
    uid: 'firebase-uid-123',
    email: 'test@example.com',
    email_verified: true,
    name: 'Test User',
    picture: 'https://example.com/avatar.jpg',
  };

  const mockUserRecord = {
    uid: 'firebase-uid-123',
    email: 'test@example.com',
    emailVerified: true,
    displayName: 'Test User',
    photoURL: 'https://example.com/avatar.jpg',
  };

  beforeEach(async () => {
    mockFirebaseAuth = {
      verifyIdToken: jest.fn(),
      getUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'FIREBASE_PROJECT_ID':
                  return 'test-project';
                case 'FIREBASE_CLIENT_EMAIL':
                  return 'test@test-project.iam.gserviceaccount.com';
                case 'FIREBASE_PRIVATE_KEY':
                  return '-----BEGIN PRIVATE KEY-----\\ntest-key\\n-----END PRIVATE KEY-----';
                default:
                  return undefined;
              }
            }),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Mock Firebase admin.auth()
    (admin.auth as jest.Mock).mockReturnValue(mockFirebaseAuth);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should initialize Firebase Admin SDK successfully', () => {
      // Clear the apps array to simulate uninitialized state
      (admin.apps as any) = [];
      
      service.onModuleInit();

      expect(admin.initializeApp).toHaveBeenCalledWith({
        credential: expect.anything(),
      });
    });

    it('should not initialize Firebase Admin SDK if already initialized', () => {
      // Simulate already initialized state
      (admin.apps as any) = [{}];
      
      service.onModuleInit();

      expect(admin.initializeApp).not.toHaveBeenCalled();
    });

    it('should throw error if Firebase initialization fails', () => {
      (admin.apps as any) = [];
      (admin.initializeApp as jest.Mock).mockImplementation(() => {
        throw new Error('Firebase initialization failed');
      });

      expect(() => service.onModuleInit()).toThrow('Firebase initialization failed');
    });
  });

  describe('verifyToken', () => {
    it('should verify token and return Firebase user', async () => {
      mockFirebaseAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      const result = await service.verifyToken('valid-token');

      expect(mockFirebaseAuth.verifyIdToken).toHaveBeenCalledWith('valid-token');
      expect(result).toEqual(mockFirebaseUser);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockFirebaseAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockFirebaseAuth.verifyIdToken).toHaveBeenCalledWith('invalid-token');
    });

    it('should handle missing email in token', async () => {
      const tokenWithoutEmail = { ...mockDecodedToken, email: undefined };
      mockFirebaseAuth.verifyIdToken.mockResolvedValue(tokenWithoutEmail);

      const result = await service.verifyToken('valid-token');

      expect(result.email).toBe('');
    });
  });

  describe('getUserById', () => {
    it('should get user by Firebase UID', async () => {
      mockFirebaseAuth.getUser.mockResolvedValue(mockUserRecord);

      const result = await service.getUserById('firebase-uid-123');

      expect(mockFirebaseAuth.getUser).toHaveBeenCalledWith('firebase-uid-123');
      expect(result).toEqual(mockFirebaseUser);
    });

    it('should return null if user not found', async () => {
      mockFirebaseAuth.getUser.mockRejectedValue(new Error('User not found'));

      const result = await service.getUserById('non-existent-uid');

      expect(result).toBeNull();
    });

    it('should handle missing email in user record', async () => {
      const userRecordWithoutEmail = { ...mockUserRecord, email: undefined };
      mockFirebaseAuth.getUser.mockResolvedValue(userRecordWithoutEmail);

      const result = await service.getUserById('firebase-uid-123');

      expect(result?.email).toBe('');
    });
  });

  describe('findOrCreateUser', () => {
    it('should update existing user', async () => {
      const existingUser = { ...mockUser };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(existingUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(existingUser);

      const result = await service.findOrCreateUser(mockFirebaseUser);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { firebaseUid: mockFirebaseUser.uid },
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual(existingUser);
    });

    it('should create new user if not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      const result = await service.findOrCreateUser(mockFirebaseUser, UserRole.CREATOR);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { firebaseUid: mockFirebaseUser.uid },
      });
      expect(userRepository.create).toHaveBeenCalledWith({
        firebaseUid: mockFirebaseUser.uid,
        email: mockFirebaseUser.email,
        name: mockFirebaseUser.name,
        role: UserRole.CREATOR,
        status: UserStatus.ACTIVE,
        emailVerified: mockFirebaseUser.emailVerified,
        profilePictureUrl: mockFirebaseUser.picture,
        lastLoginAt: expect.any(Date),
      });
      expect(result).toEqual(mockUser);
    });

    it('should use default CUSTOMER role when no role provided', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      await service.findOrCreateUser(mockFirebaseUser);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: UserRole.CUSTOMER,
        }),
      );
    });

    it('should handle repository errors', async () => {
      jest.spyOn(userRepository, 'findOne').mockRejectedValue(new Error('Database error'));

      await expect(service.findOrCreateUser(mockFirebaseUser)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('syncUserFromFirebase', () => {
    it('should sync user from Firebase successfully', async () => {
      mockFirebaseAuth.getUser.mockResolvedValue(mockUserRecord);
      jest.spyOn(service, 'findOrCreateUser').mockResolvedValue(mockUser);

      const result = await service.syncUserFromFirebase('firebase-uid-123');

      expect(mockFirebaseAuth.getUser).toHaveBeenCalledWith('firebase-uid-123');
      expect(service.findOrCreateUser).toHaveBeenCalledWith(mockFirebaseUser);
      expect(result).toEqual(mockUser);
    });

    it('should return null if Firebase user not found', async () => {
      mockFirebaseAuth.getUser.mockRejectedValue(new Error('User not found'));

      const result = await service.syncUserFromFirebase('non-existent-uid');

      expect(result).toBeNull();
    });
  });

  describe('verifyTokenAndSyncUser', () => {
    it('should verify token and sync user successfully', async () => {
      mockFirebaseAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);
      jest.spyOn(service, 'findOrCreateUser').mockResolvedValue(mockUser);

      const result = await service.verifyTokenAndSyncUser('valid-token');

      expect(mockFirebaseAuth.verifyIdToken).toHaveBeenCalledWith('valid-token');
      expect(service.findOrCreateUser).toHaveBeenCalledWith(mockFirebaseUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockFirebaseAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyTokenAndSyncUser('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getUserByFirebaseUid', () => {
    it('should get user by Firebase UID from database', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.getUserByFirebaseUid('firebase-uid-123');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { firebaseUid: 'firebase-uid-123' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found in database', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.getUserByFirebaseUid('non-existent-uid');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      jest.spyOn(userRepository, 'findOne').mockRejectedValue(new Error('Database error'));

      const result = await service.getUserByFirebaseUid('firebase-uid-123');

      expect(result).toBeNull();
    });
  });

  describe('updateUserLastLogin', () => {
    it('should update user last login timestamp', async () => {
      jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 1 } as any);

      await service.updateUserLastLogin('user-id-123');

      expect(userRepository.update).toHaveBeenCalledWith('user-id-123', {
        lastLoginAt: expect.any(Date),
      });
    });

    it('should handle update errors gracefully', async () => {
      jest.spyOn(userRepository, 'update').mockRejectedValue(new Error('Update failed'));

      // Should not throw error
      await expect(service.updateUserLastLogin('user-id-123')).resolves.toBeUndefined();
    });
  });

  describe('getAuth', () => {
    it('should return Firebase Auth instance', () => {
      const result = service.getAuth();

      expect(admin.auth).toHaveBeenCalled();
      expect(result).toBe(mockFirebaseAuth);
    });
  });
});
