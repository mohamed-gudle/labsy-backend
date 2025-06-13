/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as admin from 'firebase-admin';
import { Repository, UpdateResult } from 'typeorm';
import { Admin, Creator, Customer, Factory, User } from '../users/entities';
import { UserRole, UserStatus } from '../users/enums';
import { AuthService, FirebaseUser } from './auth.service';

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn().mockReturnValue({
      type: 'service_account',
      project_id: 'test-project',
      client_email: 'test@test.com',
    }),
  },
  auth: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let mockAuth: {
    verifyIdToken: jest.Mock;
    getUser: jest.Mock;
  };

  const mockUser: User = {
    id: '1',
    firebaseUid: 'firebase-uid-123',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    profilePictureUrl: 'https://example.com/picture.jpg',
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  } as User;

  const mockFirebaseUser: FirebaseUser = {
    uid: 'firebase-uid-123',
    email: 'test@example.com',
    emailVerified: true,
    name: 'Test User',
    picture: 'https://example.com/picture.jpg',
  };

  const mockDecodedToken = {
    uid: 'firebase-uid-123',
    email: 'test@example.com',
    email_verified: true,
    name: 'Test User',
    picture: 'https://example.com/picture.jpg',
  };

  const mockFirebaseUserRecord = {
    uid: 'firebase-uid-123',
    email: 'test@example.com',
    emailVerified: true,
    displayName: 'Test User',
    photoURL: 'https://example.com/picture.jpg',
  };

  beforeEach(async () => {
    mockAuth = {
      verifyIdToken: jest.fn(),
      getUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'FIREBASE_PROJECT_ID':
                  return 'test-project';
                case 'FIREBASE_CLIENT_EMAIL':
                  return 'test@test.com';
                case 'FIREBASE_PRIVATE_KEY':
                  return 'test-key';
                default:
                  return null;
              }
            }),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Mock Firebase auth instance
    (admin.auth as jest.Mock).mockReturnValue(mockAuth);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should initialize Firebase Admin SDK when no apps exist', () => {
      // Reset apps to empty array
      (admin.apps as admin.app.App[]) = [];

      service.onModuleInit();

      expect(admin.initializeApp).toHaveBeenCalledWith({
        credential: expect.anything(),
      });
    });

    it('should not initialize Firebase Admin SDK when app already exists', () => {
      // Set apps to have an existing app
      (admin.apps as admin.app.App[]) = [{ name: 'test-app' } as admin.app.App];

      service.onModuleInit();

      expect(admin.initializeApp).not.toHaveBeenCalled();
    });

    it('should handle initialization errors', () => {
      (admin.apps as admin.app.App[]) = [];
      const mockInitializeApp = admin.initializeApp as jest.Mock;
      mockInitializeApp.mockImplementation(() => {
        throw new Error('Initialization failed');
      });

      expect(() => service.onModuleInit()).toThrow('Initialization failed');
    });
  });

  describe('verifyToken', () => {
    it('should verify token and return FirebaseUser', async () => {
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      const result = await service.verifyToken('valid-token');

      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith('valid-token');
      expect(result).toEqual(mockFirebaseUser);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyToken('invalid-token')).rejects.toThrow(
        'Invalid or expired token',
      );
    });

    it('should handle missing email in token', async () => {
      const tokenWithoutEmail = { ...mockDecodedToken, email: undefined };
      mockAuth.verifyIdToken.mockResolvedValue(tokenWithoutEmail);

      const result = await service.verifyToken('valid-token');

      expect(result.email).toBe('');
    });
  });

  describe('getUserById', () => {
    it('should get user by Firebase UID', async () => {
      mockAuth.getUser.mockResolvedValue(mockFirebaseUserRecord);

      const result = await service.getUserById('firebase-uid-123');

      expect(mockAuth.getUser).toHaveBeenCalledWith('firebase-uid-123');
      expect(result).toEqual(mockFirebaseUser);
    });

    it('should return null when user not found', async () => {
      mockAuth.getUser.mockRejectedValue(new Error('User not found'));

      const result = await service.getUserById('non-existent-uid');

      expect(result).toBeNull();
    });

    it('should handle missing email in user record', async () => {
      const userRecordWithoutEmail = {
        ...mockFirebaseUserRecord,
        email: undefined,
      };
      mockAuth.getUser.mockResolvedValue(userRecordWithoutEmail);

      const result = await service.getUserById('firebase-uid-123');

      expect(result?.email).toBe('');
    });
  });

  describe('findOrCreateUser', () => {
    it('should return existing user and update info', async () => {
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

    it('should create new customer user when user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      const newCustomer = new Customer();
      Object.assign(newCustomer, mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(newCustomer);

      const result = await service.findOrCreateUser(
        mockFirebaseUser,
        UserRole.CUSTOMER,
      );

      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Customer);
    });

    it('should create new creator user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      const newCreator = new Creator();
      Object.assign(newCreator, mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(newCreator);

      const result = await service.findOrCreateUser(
        mockFirebaseUser,
        UserRole.CREATOR,
      );

      expect(result).toBeInstanceOf(Creator);
    });

    it('should create new factory user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      const newFactory = new Factory();
      Object.assign(newFactory, mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(newFactory);

      const result = await service.findOrCreateUser(
        mockFirebaseUser,
        UserRole.FACTORY,
      );

      expect(result).toBeInstanceOf(Factory);
    });

    it('should create new admin user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      const newAdmin = new Admin();
      Object.assign(newAdmin, mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(newAdmin);

      const result = await service.findOrCreateUser(
        mockFirebaseUser,
        UserRole.ADMIN,
      );

      expect(result).toBeInstanceOf(Admin);
    });

    it('should handle repository errors', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.findOrCreateUser(mockFirebaseUser)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('syncUserFromFirebase', () => {
    it('should sync user from Firebase', async () => {
      mockAuth.getUser.mockResolvedValue(mockFirebaseUserRecord);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      const newUser = new Customer();
      Object.assign(newUser, mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(newUser);

      const result = await service.syncUserFromFirebase('firebase-uid-123');

      expect(mockAuth.getUser).toHaveBeenCalledWith('firebase-uid-123');
      expect(result).toEqual(newUser);
    });

    it('should return null when Firebase user not found', async () => {
      mockAuth.getUser.mockRejectedValue(new Error('User not found'));

      const result = await service.syncUserFromFirebase('non-existent-uid');

      expect(result).toBeNull();
    });
  });

  describe('verifyTokenAndSyncUser', () => {
    it('should verify token and sync user', async () => {
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      const result = await service.verifyTokenAndSyncUser('valid-token');

      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith('valid-token');
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await expect(
        service.verifyTokenAndSyncUser('invalid-token'),
      ).rejects.toThrow('Invalid or expired token');
    });
  });

  describe('getUserByFirebaseUid', () => {
    it('should get user by Firebase UID', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.getUserByFirebaseUid('firebase-uid-123');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { firebaseUid: 'firebase-uid-123' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.getUserByFirebaseUid('non-existent-uid');

      expect(result).toBeNull();
    });

    it('should handle repository errors', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      const result = await service.getUserByFirebaseUid('firebase-uid-123');

      expect(result).toBeNull();
    });
  });

  describe('updateUserLastLogin', () => {
    it('should update user last login', async () => {
      const updateResult: UpdateResult = {
        affected: 1,
        raw: {},
        generatedMaps: [],
      };
      jest.spyOn(userRepository, 'update').mockResolvedValue(updateResult);

      await service.updateUserLastLogin('user-id');

      expect(userRepository.update).toHaveBeenCalledWith('user-id', {
        lastLoginAt: expect.any(Date),
      });
    });

    it('should handle update errors', async () => {
      jest
        .spyOn(userRepository, 'update')
        .mockRejectedValue(new Error('Update failed'));

      // Should not throw, just log error
      await expect(
        service.updateUserLastLogin('user-id'),
      ).resolves.toBeUndefined();
    });
  });

  describe('verifyFirebaseToken', () => {
    it('should verify Firebase token', async () => {
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      const result = await service.verifyFirebaseToken('valid-token');

      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith('valid-token');
      expect(result).toEqual(mockDecodedToken);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await expect(
        service.verifyFirebaseToken('invalid-token'),
      ).rejects.toThrow('Invalid or expired token');
    });
  });

  describe('findUserByFirebaseUid', () => {
    it('should find user by Firebase UID', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.findUserByFirebaseUid('firebase-uid-123');

      expect(result).toEqual(mockUser);
    });
  });
});
