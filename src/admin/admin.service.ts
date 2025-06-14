import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  /**
   * Create a new factory account (Admin only)
   */
  async createFactory(
    createFactoryDto: CreateFactoryDto,
    adminUser: User,
  ): Promise<Factory> {
    this.validateAdminPermissions(adminUser);

    try {
      // Check if user already exists by email
      const existingUser = await this.userRepository.findOne({
        where: { email: createFactoryDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Create new factory account (invitation-based)
      const factory = new Factory();
      factory.firebaseUid = ''; // Will be set when user completes registration
      factory.email = createFactoryDto.email;
      factory.name = createFactoryDto.name;
      factory.role = UserRole.FACTORY;
      factory.status = UserStatus.PENDING; // Account is pending until user completes registration
      factory.emailVerified = false;

      // Set factory-specific fields
      factory.companyName = createFactoryDto.businessName;
      factory.phone = createFactoryDto.phone;
      factory.companyDescription = createFactoryDto.businessDescription;
      factory.contactPerson = createFactoryDto.name;
      factory.businessLicense =
        createFactoryDto.businessRegistrationNumber ?? '';
      factory.taxId = createFactoryDto.taxId ?? '';

      // Map location data to match entity structure
      factory.location = {
        addressLine1:
          createFactoryDto.location.fullAddress ??
          `${createFactoryDto.location.city}, ${createFactoryDto.location.region}`,
        city: createFactoryDto.location.city,
        state: createFactoryDto.location.region,
        postalCode: createFactoryDto.location.postalCode ?? '',
        country: createFactoryDto.location.country,
      };

      // Map capabilities if provided
      if (createFactoryDto.capabilities) {
        factory.capabilities = {
          printingMethods: createFactoryDto.capabilities.printMethods ?? [],
          materials: createFactoryDto.capabilities.materialTypes ?? [],
          productTypes: createFactoryDto.capabilities.productCategories ?? [],
          colors: [],
          finishingOptions: [],
        };
      } else {
        factory.capabilities = {
          printingMethods: [],
          materials: [],
          productTypes: [],
          colors: [],
          finishingOptions: [],
        };
      }

      const savedFactory = await this.userRepository.save(factory);

      this.logger.log(
        `Factory account created by admin ${adminUser.id}: ${savedFactory.id} (${savedFactory.email}) - Status: PENDING`,
      );

      return savedFactory as Factory;
    } catch (error) {
      this.logger.error('Failed to create factory', error);
      throw error;
    }
  }

  /**
   * Create a new admin account (Super Admin only)
   */
  async createAdmin(
    createAdminDto: CreateAdminDto,
    superAdminUser: User,
  ): Promise<Admin> {
    this.validateSuperAdminPermissions(superAdminUser);

    try {
      // Check if user already exists by email
      const existingUser = await this.userRepository.findOne({
        where: { email: createAdminDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Create new admin account (invitation-based)
      const admin = new Admin();
      admin.firebaseUid = ''; // Will be set when user completes registration
      admin.email = createAdminDto.email;
      admin.name = createAdminDto.name;
      admin.role = UserRole.ADMIN;
      admin.status = UserStatus.PENDING; // Account is pending until user completes registration
      admin.emailVerified = false;

      // Set admin-specific fields
      admin.phone = createAdminDto.phone;
      admin.adminLevel = this.mapAdminRole(createAdminDto.adminRole);
      admin.permissions = createAdminDto.permissions
        ? createAdminDto.permissions.map((p) => p.toString())
        : this.getDefaultPermissions(createAdminDto.adminRole).map((p) =>
            p.toString(),
          );
      admin.department = createAdminDto.department;
      admin.position = createAdminDto.jobTitle;
      admin.employeeId = createAdminDto.employeeId ?? this.generateEmployeeId();

      const savedAdmin = await this.userRepository.save(admin);

      this.logger.log(
        `Admin account created by super admin ${superAdminUser.id}: ${savedAdmin.id} (${savedAdmin.email}) - Status: PENDING`,
      );

      return savedAdmin as Admin;
    } catch (error) {
      this.logger.error('Failed to create admin', error);
      throw error;
    }
  }

  /**
   * Update user status (suspend/activate/delete)
   */
  async updateUserStatus(
    userId: string,
    updateStatusDto: UpdateUserStatusDto,
    adminUser: User,
  ): Promise<User> {
    this.validateAdminPermissions(adminUser);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent admins from modifying other admin accounts unless super admin
    if (user.role === UserRole.ADMIN && !this.isSuperAdmin(adminUser)) {
      throw new ForbiddenException(
        'Only super admins can modify admin accounts',
      );
    }

    const oldStatus = user.status;
    user.status = updateStatusDto.status;

    // Handle soft delete
    if (updateStatusDto.status === UserStatus.DELETED) {
      user.deletedAt = new Date();
    } else if (oldStatus === UserStatus.DELETED) {
      user.deletedAt = undefined;
    }

    const savedUser = await this.userRepository.save(user);

    this.logger.log(
      `User status updated by admin ${adminUser.id}: User ${userId} status changed from ${oldStatus} to ${updateStatusDto.status}. Reason: ${updateStatusDto.reason}`,
    );

    return savedUser;
  }

  /**
   * Soft delete user account
   */
  async deleteUser(userId: string, adminUser: User): Promise<void> {
    await this.updateUserStatus(
      userId,
      {
        status: UserStatus.DELETED,
        reason: 'Account deleted by admin',
      },
      adminUser,
    );
  }

  /**
   * Get all users with pagination and filtering
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 20,
    role?: UserRole,
    status?: UserStatus,
  ): Promise<{ users: User[]; total: number; totalPages: number }> {
    const query = this.userRepository.createQueryBuilder('user');

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    if (status) {
      query.andWhere('user.status = :status', { status });
    }

    query
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await query.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { users, total, totalPages };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Validate admin permissions
   */
  private validateAdminPermissions(user: User): void {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Admin account is not active');
    }

    // Additional permission checks can be added here
    // For now, we'll allow all active admins to perform these operations
  }

  /**
   * Validate super admin permissions
   */
  private validateSuperAdminPermissions(user: User): void {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Admin account is not active');
    }

    const admin = user as Admin;
    if (admin.adminLevel !== 'super_admin') {
      throw new ForbiddenException('Super admin access required');
    }
  }

  /**
   * Check if user is super admin
   */
  private isSuperAdmin(user: User): boolean {
    if (user.role !== UserRole.ADMIN) {
      return false;
    }

    const admin = user as Admin;
    return admin.adminLevel === 'super_admin';
  }

  /**
   * Map AdminRole enum to admin level string
   */
  private mapAdminRole(
    adminRole: AdminRole,
  ): 'super_admin' | 'admin' | 'moderator' | 'support' {
    switch (adminRole) {
      case AdminRole.SUPER_ADMIN:
        return 'super_admin';
      case AdminRole.ADMIN:
        return 'admin';
      case AdminRole.MODERATOR:
        return 'moderator';
      case AdminRole.SUPPORT:
        return 'support';
      default:
        return 'support';
    }
  }

  /**
   * Generate unique employee ID
   */
  private generateEmployeeId(): string {
    const prefix = 'EMP';
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${prefix}${timestamp.slice(-6)}${random}`;
  }

  /**
   * Get default permissions based on admin role
   */
  private getDefaultPermissions(adminRole: AdminRole): AdminPermission[] {
    switch (adminRole) {
      case AdminRole.SUPER_ADMIN:
        return Object.values(AdminPermission);
      case AdminRole.ADMIN:
        return [
          AdminPermission.USER_MANAGEMENT,
          AdminPermission.FACTORY_MANAGEMENT,
          AdminPermission.ORDER_MANAGEMENT,
          AdminPermission.ANALYTICS_ACCESS,
        ];
      case AdminRole.MODERATOR:
        return [
          AdminPermission.USER_MANAGEMENT,
          AdminPermission.ORDER_MANAGEMENT,
          AdminPermission.SUPPORT_TICKETS,
        ];
      case AdminRole.SUPPORT:
        return [
          AdminPermission.SUPPORT_TICKETS,
          AdminPermission.ORDER_MANAGEMENT,
        ];
      default:
        return [];
    }
  }
}
