/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthService } from '../auth/auth.service';
import { User, Factory, Admin } from '../users/entities';
import { UserRole, UserStatus } from '../users/enums';
import {
  CreateFactoryDto,
  CreateAdminDto,
  UpdateUserStatusDto,
  AdminRole,
  AdminPermission,
} from './dto';

describe('AdminService', () => {
  let service: AdminService;
  let userRepository: jest.Mocked<Repository<User>>;
  let authService: jest.Mocked<AuthService>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firebaseUid: 'firebase-uid-123',
    email: 'admin@example.com',
    name: 'Test Admin',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    profilePictureUrl: 'https://example.com/picture.jpg',
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  } as User;

  const mockSuperAdmin: Admin = {
    ...mockUser,
    adminLevel: 'super_admin',
    employeeId: 'EMP001',
    permissions: Object.values(AdminPermission).map((p) => p.toString()),
    twoFactorEnabled: false,
  } as Admin;

  const mockFirebaseUser = {
    uid: 'firebase-uid-123',
    email: 'test@example.com',
    emailVerified: true,
    name: 'Test User',
    picture: 'https://example.com/picture.jpg',
  };

  const mockFactory: Factory = {
    ...mockUser,
    role: UserRole.FACTORY,
    companyName: 'Test Factory',
    contactPerson: 'John Doe',
    businessLicense: 'BL123456',
    taxId: 'TAX123456',
    location: {
      addressLine1: 'Test Address',
      city: 'Riyadh',
      country: 'Saudi Arabia',
      postalCode: '12345',
    },
    capabilities: {
      printingMethods: ['screen_printing'],
      materials: ['cotton'],
      productTypes: ['t_shirts'],
      colors: ['black', 'white'],
      finishingOptions: ['heat_press'],
    },
  } as Factory;

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      createQueryBuilder: jest.fn(),
      update: jest.fn(),
    };

    const mockAuthService = {
      verifyToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    userRepository = module.get(getRepositoryToken(User));
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFactory', () => {
    const createFactoryDto: CreateFactoryDto = {
      token: 'firebase-token',
      email: 'factory@example.com',
      name: 'Test Factory',
      businessName: 'Test Factory LLC',
      businessRegistrationNumber: 'BR123456',
      taxId: 'TAX123456',
      phone: '+966501234567',
      location: {
        city: 'Riyadh',
        region: 'Riyadh Region',
        country: 'Saudi Arabia',
        postalCode: '12345',
      },
      capabilities: {
        printMethods: ['screen_printing'],
        materialTypes: ['cotton'],
        productCategories: ['t_shirts'],
        maxCapacityPerDay: 100,
      },
    };

    it('should create factory successfully', async () => {
      authService.verifyToken.mockResolvedValue(mockFirebaseUser);
      userRepository.findOne.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(mockFactory);

      const result = await service.createFactory(
        createFactoryDto,
        mockSuperAdmin,
      );

      expect(authService.verifyToken).toHaveBeenCalledWith('firebase-token');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { firebaseUid: mockFirebaseUser.uid },
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockFactory);
    });

    it('should throw ConflictException if user already exists', async () => {
      authService.verifyToken.mockResolvedValue(mockFirebaseUser);
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.createFactory(createFactoryDto, mockSuperAdmin),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if email does not match', async () => {
      const differentEmailUser = {
        ...mockFirebaseUser,
        email: 'different@example.com',
      };
      authService.verifyToken.mockResolvedValue(differentEmailUser);
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createFactory(createFactoryDto, mockSuperAdmin),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if user is not admin', async () => {
      const nonAdminUser = { ...mockUser, role: UserRole.CUSTOMER };

      await expect(
        service.createFactory(createFactoryDto, nonAdminUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if admin is not active', async () => {
      const inactiveAdmin = { ...mockSuperAdmin, status: UserStatus.SUSPENDED };

      await expect(
        service.createFactory(createFactoryDto, inactiveAdmin),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createAdmin', () => {
    const createAdminDto: CreateAdminDto = {
      token: 'firebase-token',
      email: 'newadmin@example.com',
      name: 'New Admin',
      adminRole: AdminRole.ADMIN,
      department: 'Operations',
      jobTitle: 'Operations Manager',
      phone: '+966501234567',
      permissions: [AdminPermission.USER_MANAGEMENT],
    };

    it('should create admin successfully', async () => {
      const newAdmin = {
        ...mockUser,
        role: UserRole.ADMIN,
        adminLevel: 'admin',
      } as Admin;
      authService.verifyToken.mockResolvedValue(mockFirebaseUser);
      userRepository.findOne.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(newAdmin);

      const result = await service.createAdmin(createAdminDto, mockSuperAdmin);

      expect(authService.verifyToken).toHaveBeenCalledWith('firebase-token');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { firebaseUid: mockFirebaseUser.uid },
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual(newAdmin);
    });

    it('should throw ForbiddenException if user is not super admin', async () => {
      const regularAdmin = { ...mockSuperAdmin, adminLevel: 'admin' } as Admin;

      await expect(
        service.createAdmin(createAdminDto, regularAdmin),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should use default permissions when none provided', async () => {
      const dtoWithoutPermissions = { ...createAdminDto };
      delete dtoWithoutPermissions.permissions;

      const newAdmin = {
        ...mockUser,
        role: UserRole.ADMIN,
        adminLevel: 'admin',
      } as Admin;
      authService.verifyToken.mockResolvedValue(mockFirebaseUser);
      userRepository.findOne.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(newAdmin);

      await service.createAdmin(dtoWithoutPermissions, mockSuperAdmin);

      expect(userRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateUserStatus', () => {
    const updateStatusDto: UpdateUserStatusDto = {
      status: UserStatus.SUSPENDED,
      reason: 'Violation of terms',
    };

    it('should update user status successfully', async () => {
      const userToUpdate = { ...mockUser, role: UserRole.CUSTOMER };
      const updatedUser = { ...userToUpdate, status: UserStatus.SUSPENDED };

      userRepository.findOne.mockResolvedValue(userToUpdate);
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateUserStatus(
        'user-id',
        updateStatusDto,
        mockSuperAdmin,
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: UserStatus.SUSPENDED }),
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateUserStatus(
          'non-existent-id',
          updateStatusDto,
          mockSuperAdmin,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when regular admin tries to modify another admin', async () => {
      const regularAdmin = { ...mockSuperAdmin, adminLevel: 'admin' } as Admin;
      const adminToUpdate = { ...mockUser, role: UserRole.ADMIN };

      userRepository.findOne.mockResolvedValue(adminToUpdate);

      await expect(
        service.updateUserStatus('admin-id', updateStatusDto, regularAdmin),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle soft delete properly', async () => {
      const deleteStatusDto = {
        status: UserStatus.DELETED,
        reason: 'Account deletion requested',
      };
      const userToDelete = { ...mockUser, role: UserRole.CUSTOMER };

      userRepository.findOne.mockResolvedValue(userToDelete);
      userRepository.save.mockResolvedValue({
        ...userToDelete,
        status: UserStatus.DELETED,
        deletedAt: expect.any(Date),
      });

      await service.updateUserStatus(
        'user-id',
        deleteStatusDto,
        mockSuperAdmin,
      );

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: UserStatus.DELETED,
          deletedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      const mockUsers = [mockUser];
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockUsers, 1]),
      };

      userRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.getAllUsers(1, 20);

      expect(result).toEqual({
        users: mockUsers,
        total: 1,
        totalPages: 1,
      });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'user.createdAt',
        'DESC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });

    it('should filter by role when provided', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      userRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.getAllUsers(1, 20, UserRole.FACTORY);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'user.role = :role',
        {
          role: UserRole.FACTORY,
        },
      );
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserById('user-id');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user', async () => {
      const userToDelete = { ...mockUser, role: UserRole.CUSTOMER };
      userRepository.findOne.mockResolvedValue(userToDelete);
      userRepository.save.mockResolvedValue({
        ...userToDelete,
        status: UserStatus.DELETED,
      });

      await service.deleteUser('user-id', mockSuperAdmin);

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: UserStatus.DELETED }),
      );
    });
  });

  describe('private methods', () => {
    describe('validateAdminPermissions', () => {
      it('should pass for active admin', () => {
        expect(() => {
          (service as any).validateAdminPermissions(mockSuperAdmin);
        }).not.toThrow();
      });

      it('should throw for non-admin user', () => {
        const nonAdmin = { ...mockUser, role: UserRole.CUSTOMER };
        expect(() => {
          (service as any).validateAdminPermissions(nonAdmin);
        }).toThrow(ForbiddenException);
      });

      it('should throw for inactive admin', () => {
        const inactiveAdmin = {
          ...mockSuperAdmin,
          status: UserStatus.SUSPENDED,
        };
        expect(() => {
          (service as any).validateAdminPermissions(inactiveAdmin);
        }).toThrow(ForbiddenException);
      });
    });

    describe('mapAdminRole', () => {
      it('should map admin roles correctly', () => {
        expect((service as any).mapAdminRole(AdminRole.SUPER_ADMIN)).toBe(
          'super_admin',
        );
        expect((service as any).mapAdminRole(AdminRole.ADMIN)).toBe('admin');
        expect((service as any).mapAdminRole(AdminRole.MODERATOR)).toBe(
          'moderator',
        );
        expect((service as any).mapAdminRole(AdminRole.SUPPORT)).toBe(
          'support',
        );
      });
    });

    describe('generateEmployeeId', () => {
      it('should generate unique employee ID with correct format', () => {
        const employeeId = (service as any).generateEmployeeId();
        expect(employeeId).toMatch(/^EMP\d{9}$/);
        expect(employeeId).toHaveLength(12);
      });
    });

    describe('getDefaultPermissions', () => {
      it('should return all permissions for super admin', () => {
        const permissions = (service as any).getDefaultPermissions(
          AdminRole.SUPER_ADMIN,
        );
        expect(permissions).toEqual(Object.values(AdminPermission));
      });

      it('should return specific permissions for admin', () => {
        const permissions = (service as any).getDefaultPermissions(
          AdminRole.ADMIN,
        );
        expect(permissions).toContain(AdminPermission.USER_MANAGEMENT);
        expect(permissions).toContain(AdminPermission.FACTORY_MANAGEMENT);
      });

      it('should return limited permissions for support', () => {
        const permissions = (service as any).getDefaultPermissions(
          AdminRole.SUPPORT,
        );
        expect(permissions).toContain(AdminPermission.SUPPORT_TICKETS);
        expect(permissions).toContain(AdminPermission.ORDER_MANAGEMENT);
        expect(permissions).not.toContain(AdminPermission.USER_MANAGEMENT);
      });
    });
  });
});
