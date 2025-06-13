/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Factory, Admin } from '../users/entities';
import { UserRole, UserStatus } from '../users/enums';
import {
  CreateFactoryDto,
  CreateAdminDto,
  UpdateUserStatusDto,
  AdminRole,
  AdminPermission,
} from './dto';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: jest.Mocked<AdminService>;

  const mockSuperAdmin: Admin = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firebaseUid: 'firebase-uid-123',
    email: 'admin@example.com',
    name: 'Test Super Admin',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    profilePictureUrl: 'https://example.com/picture.jpg',
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    adminLevel: 'super_admin',
    employeeId: 'EMP001',
    permissions: Object.values(AdminPermission).map((p) => p.toString()),
    twoFactorEnabled: false,
    department: 'IT',
    position: 'Super Administrator',
  } as Admin;

  const mockFactory: Factory = {
    id: '456e4567-e89b-12d3-a456-426614174000',
    firebaseUid: 'firebase-uid-456',
    email: 'factory@example.com',
    name: 'Test Factory',
    role: UserRole.FACTORY,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    profilePictureUrl: 'https://example.com/factory.jpg',
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    companyName: 'Test Factory LLC',
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

  const mockAdmin: Admin = {
    id: '789e4567-e89b-12d3-a456-426614174000',
    firebaseUid: 'firebase-uid-789',
    email: 'newadmin@example.com',
    name: 'New Admin',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    profilePictureUrl: 'https://example.com/admin.jpg',
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    adminLevel: 'admin',
    employeeId: 'EMP002',
    permissions: [AdminPermission.USER_MANAGEMENT.toString()],
    twoFactorEnabled: false,
    department: 'Operations',
    position: 'Operations Manager',
  } as Admin;

  beforeEach(async () => {
    const mockAdminService = {
      createFactory: jest.fn(),
      createAdmin: jest.fn(),
      updateUserStatus: jest.fn(),
      deleteUser: jest.fn(),
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      adminService.createFactory.mockResolvedValue(mockFactory);

      const result = await controller.createFactory(
        createFactoryDto,
        mockSuperAdmin,
      );

      expect(adminService.createFactory).toHaveBeenCalledWith(
        createFactoryDto,
        mockSuperAdmin,
      );
      expect(result).toEqual(mockFactory);
    });

    it('should handle ConflictException', async () => {
      adminService.createFactory.mockRejectedValue(
        new ConflictException('User already registered'),
      );

      await expect(
        controller.createFactory(createFactoryDto, mockSuperAdmin),
      ).rejects.toThrow(ConflictException);
    });

    it('should handle BadRequestException', async () => {
      adminService.createFactory.mockRejectedValue(
        new BadRequestException('Email does not match Firebase token'),
      );

      await expect(
        controller.createFactory(createFactoryDto, mockSuperAdmin),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle ForbiddenException', async () => {
      adminService.createFactory.mockRejectedValue(
        new ForbiddenException('Admin access required'),
      );

      await expect(
        controller.createFactory(createFactoryDto, mockSuperAdmin),
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
      adminService.createAdmin.mockResolvedValue(mockAdmin);

      const result = await controller.createAdmin(
        createAdminDto,
        mockSuperAdmin,
      );

      expect(adminService.createAdmin).toHaveBeenCalledWith(
        createAdminDto,
        mockSuperAdmin,
      );
      expect(result).toEqual(mockAdmin);
    });

    it('should handle ForbiddenException for non-super admin', async () => {
      adminService.createAdmin.mockRejectedValue(
        new ForbiddenException('Super admin access required'),
      );

      await expect(
        controller.createAdmin(createAdminDto, mockSuperAdmin),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle ConflictException', async () => {
      adminService.createAdmin.mockRejectedValue(
        new ConflictException('User already registered'),
      );

      await expect(
        controller.createAdmin(createAdminDto, mockSuperAdmin),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateUserStatus', () => {
    const updateStatusDto: UpdateUserStatusDto = {
      status: UserStatus.SUSPENDED,
      reason: 'Violation of terms',
    };

    it('should update user status successfully', async () => {
      const updatedUser = { ...mockFactory, status: UserStatus.SUSPENDED };
      adminService.updateUserStatus.mockResolvedValue(updatedUser);

      const result = await controller.updateUserStatus(
        'user-id',
        updateStatusDto,
        mockSuperAdmin,
      );

      expect(adminService.updateUserStatus).toHaveBeenCalledWith(
        'user-id',
        updateStatusDto,
        mockSuperAdmin,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should handle NotFoundException', async () => {
      adminService.updateUserStatus.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.updateUserStatus(
          'non-existent-id',
          updateStatusDto,
          mockSuperAdmin,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle ForbiddenException', async () => {
      adminService.updateUserStatus.mockRejectedValue(
        new ForbiddenException('Only super admins can modify admin accounts'),
      );

      await expect(
        controller.updateUserStatus(
          'admin-id',
          updateStatusDto,
          mockSuperAdmin,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      adminService.deleteUser.mockResolvedValue(undefined);

      const result = await controller.deleteUser('user-id', mockSuperAdmin);

      expect(adminService.deleteUser).toHaveBeenCalledWith(
        'user-id',
        mockSuperAdmin,
      );
      expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('should handle NotFoundException', async () => {
      adminService.deleteUser.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.deleteUser('non-existent-id', mockSuperAdmin),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllUsers', () => {
    const mockPaginatedResult = {
      users: [mockFactory, mockAdmin],
      total: 2,
      totalPages: 1,
    };

    it('should get all users with default pagination', async () => {
      adminService.getAllUsers.mockResolvedValue(mockPaginatedResult);

      const result = await controller.getAllUsers(1, 20);

      expect(adminService.getAllUsers).toHaveBeenCalledWith(
        1,
        20,
        undefined,
        undefined,
      );
      expect(result).toEqual({
        ...mockPaginatedResult,
        currentPage: 1,
        limit: 20,
      });
    });

    it('should get users with custom pagination', async () => {
      adminService.getAllUsers.mockResolvedValue(mockPaginatedResult);

      const result = await controller.getAllUsers(2, 10);

      expect(adminService.getAllUsers).toHaveBeenCalledWith(
        2,
        10,
        undefined,
        undefined,
      );
      expect(result).toEqual({
        ...mockPaginatedResult,
        currentPage: 2,
        limit: 10,
      });
    });

    it('should get users with role filter', async () => {
      const factoryUsers = {
        users: [mockFactory],
        total: 1,
        totalPages: 1,
      };
      adminService.getAllUsers.mockResolvedValue(factoryUsers);

      const result = await controller.getAllUsers(1, 20, UserRole.FACTORY);

      expect(adminService.getAllUsers).toHaveBeenCalledWith(
        1,
        20,
        UserRole.FACTORY,
        undefined,
      );
      expect(result).toEqual({
        ...factoryUsers,
        currentPage: 1,
        limit: 20,
      });
    });

    it('should get users with status filter', async () => {
      const activeUsers = {
        users: [mockFactory, mockAdmin],
        total: 2,
        totalPages: 1,
      };
      adminService.getAllUsers.mockResolvedValue(activeUsers);

      const result = await controller.getAllUsers(
        1,
        20,
        undefined,
        UserStatus.ACTIVE,
      );

      expect(adminService.getAllUsers).toHaveBeenCalledWith(
        1,
        20,
        undefined,
        UserStatus.ACTIVE,
      );
      expect(result).toEqual({
        ...activeUsers,
        currentPage: 1,
        limit: 20,
      });
    });

    it('should handle pagination limits', async () => {
      adminService.getAllUsers.mockResolvedValue(mockPaginatedResult);

      // Test minimum limit
      await controller.getAllUsers(1, 1);
      expect(adminService.getAllUsers).toHaveBeenCalledWith(
        1,
        1,
        undefined,
        undefined,
      );

      // Test maximum limit
      await controller.getAllUsers(1, 100);
      expect(adminService.getAllUsers).toHaveBeenCalledWith(
        1,
        100,
        undefined,
        undefined,
      );
    });
  });

  describe('getUserById', () => {
    it('should get user by ID successfully', async () => {
      adminService.getUserById.mockResolvedValue(mockFactory);

      const result = await controller.getUserById('user-id');

      expect(adminService.getUserById).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockFactory);
    });

    it('should handle NotFoundException', async () => {
      adminService.getUserById.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.getUserById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('error handling', () => {
    it('should propagate service errors correctly', async () => {
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
      };

      adminService.createFactory.mockRejectedValue(
        new Error('Unexpected error'),
      );

      await expect(
        controller.createFactory(createFactoryDto, mockSuperAdmin),
      ).rejects.toThrow('Unexpected error');
    });
  });

  describe('input validation', () => {
    it('should work with valid UUID format for user ID', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      adminService.getUserById.mockResolvedValue(mockFactory);

      await controller.getUserById(validUuid);

      expect(adminService.getUserById).toHaveBeenCalledWith(validUuid);
    });
  });
});
