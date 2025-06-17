import {
  Injectable,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService, FirebaseUser } from '../auth/auth.service';
import { User, Customer, Creator } from './entities';
import { UserRole } from './enums';
import {
  CreateCustomerDto,
  CreateCreatorDto,
  CustomerResponseDto,
  CreatorResponseDto,
  UpdateCustomerProfileDto,
  UpdateCreatorProfileDto,
} from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async registerCustomer(
    createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const { token, ...customerData } = createCustomerDto;

    // Verify Firebase token and get user info
    const firebaseUser = await this.authService.verifyToken(token);

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { firebaseUid: firebaseUser.uid },
    });

    if (existingUser) {
      throw new ConflictException('User already registered');
    }

    // Check if email matches
    if (firebaseUser.email !== customerData.email) {
      throw new BadRequestException('Email does not match Firebase token');
    }

    // Create new customer
    const customer = new Customer();
    customer.firebaseUid = firebaseUser.uid;
    customer.email = firebaseUser.email;
    customer.name = customerData.name;
    customer.role = UserRole.CUSTOMER;
    customer.emailVerified = firebaseUser.emailVerified;
    customer.profilePictureUrl = firebaseUser.picture;
    customer.phone = customerData.phone;
    customer.preferredLanguage =
      (customerData.preferredLanguage as 'ar' | 'en') ?? 'ar';

    const savedCustomer = await this.userRepository.save(customer);

    return this.mapCustomerToResponse(savedCustomer as Customer);
  }

  async registerCreator(
    createCreatorDto: CreateCreatorDto,
    user: FirebaseUser,
  ): Promise<CreatorResponseDto> {
    const { ...creatorData } = createCreatorDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { firebaseUid: user.uid },
    });

    if (existingUser) {
      throw new ConflictException('User already registered');
    }

    // Create new creator
    const creator = new Creator();
    creator.firebaseUid = user.uid;
    creator.email = user.email;
    creator.name = creatorData.name;
    creator.role = UserRole.CREATOR;
    creator.emailVerified = user.emailVerified;
    creator.profilePictureUrl = user.picture;
    creator.phone = creatorData.phone;
    creator.businessName = creatorData.businessName;
    creator.businessDescription = creatorData.businessDescription;
    creator.socialMediaLinks = creatorData.socialMediaLinks;

    const savedCreator = await this.userRepository.save(creator);

    return this.mapCreatorToResponse(savedCreator as Creator);
  }

  async getProfile(
    userId: string,
  ): Promise<CustomerResponseDto | CreatorResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.role === UserRole.CUSTOMER) {
      return this.mapCustomerToResponse(user as Customer);
    } else if (user.role === UserRole.CREATOR) {
      return this.mapCreatorToResponse(user as Creator);
    }

    throw new BadRequestException('Invalid user role for profile management');
  }

  async updateCustomerProfile(
    userId: string,
    updateData: UpdateCustomerProfileDto,
  ): Promise<CustomerResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, role: UserRole.CUSTOMER },
    });

    if (!user) {
      throw new BadRequestException('Customer not found');
    }

    const customer = user as Customer;

    // Update fields if provided
    if (updateData.name !== undefined) {
      customer.name = updateData.name;
    }
    if (updateData.phone !== undefined) {
      customer.phone = updateData.phone;
    }
    if (updateData.preferredLanguage !== undefined) {
      customer.preferredLanguage = updateData.preferredLanguage as 'ar' | 'en';
    }

    // Update profile completion percentage
    customer.profileCompletionPercentage =
      this.calculateCustomerProfileCompletion(customer);

    const savedCustomer = await this.userRepository.save(customer);
    return this.mapCustomerToResponse(savedCustomer as Customer);
  }

  async updateCreatorProfile(
    userId: string,
    updateData: UpdateCreatorProfileDto,
  ): Promise<CreatorResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, role: UserRole.CREATOR },
    });

    if (!user) {
      throw new BadRequestException('Creator not found');
    }

    const creator = user as Creator;

    // Update fields if provided
    if (updateData.name !== undefined) {
      creator.name = updateData.name;
    }
    if (updateData.phone !== undefined) {
      creator.phone = updateData.phone;
    }
    if (updateData.businessName !== undefined) {
      creator.businessName = updateData.businessName;
    }
    if (updateData.businessDescription !== undefined) {
      creator.businessDescription = updateData.businessDescription;
    }
    if (updateData.socialMediaLinks !== undefined) {
      creator.socialMediaLinks = {
        ...creator.socialMediaLinks,
        ...updateData.socialMediaLinks,
      };
    }

    // Update profile completion percentage
    creator.profileCompletionPercentage =
      this.calculateCreatorProfileCompletion(creator);

    const savedCreator = await this.userRepository.save(creator);
    return this.mapCreatorToResponse(savedCreator as Creator);
  }

  async updateProfilePicture(
    userId: string,
    profilePictureUrl: string | null,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.profilePictureUrl = profilePictureUrl ?? undefined;

    // Update profile completion percentage
    if (user.role === UserRole.CUSTOMER) {
      const customer = user as Customer;
      customer.profileCompletionPercentage =
        this.calculateCustomerProfileCompletion(customer);
    } else if (user.role === UserRole.CREATOR) {
      const creator = user as Creator;
      creator.profileCompletionPercentage =
        this.calculateCreatorProfileCompletion(creator);
    }

    await this.userRepository.save(user);
  }

  private mapCustomerToResponse(customer: Customer): CustomerResponseDto {
    return {
      id: customer.id,
      firebaseUid: customer.firebaseUid,
      email: customer.email,
      name: customer.name ?? '',
      role: customer.role,
      status: customer.status,
      profilePictureUrl: customer.profilePictureUrl,
      emailVerified: customer.emailVerified,
      lastLoginAt: customer.lastLoginAt,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      phone: customer.phone,
      preferredLanguage: customer.preferredLanguage,
      shippingAddresses: customer.shippingAddresses ?? [],
      profileCompletion: this.calculateCustomerProfileCompletion(customer),
    };
  }

  private mapCreatorToResponse(creator: Creator): CreatorResponseDto {
    return {
      id: creator.id,
      firebaseUid: creator.firebaseUid,
      email: creator.email,
      name: creator.name ?? '',
      role: creator.role,
      status: creator.status,
      profilePictureUrl: creator.profilePictureUrl,
      emailVerified: creator.emailVerified,
      lastLoginAt: creator.lastLoginAt,
      createdAt: creator.createdAt,
      updatedAt: creator.updatedAt,
      phone: creator.phone,
      businessName: creator.businessName ?? '',
      businessDescription: creator.businessDescription,
      preferredLanguage: 'ar', // Default since it's not in Creator entity
      socialMediaLinks: creator.socialMediaLinks,

      profileCompletion: this.calculateCreatorProfileCompletion(creator),
      isVerified: creator.verificationStatus === 'verified',
    };
  }

  private calculateCustomerProfileCompletion(customer: Customer): number {
    const fields = [
      customer.name,
      customer.email,
      customer.phone,
      customer.profilePictureUrl,
      customer.preferredLanguage,
    ];

    const completedFields = fields.filter(
      (field) => field && field.trim() !== '',
    ).length;
    return Math.round((completedFields / fields.length) * 100);
  }

  private calculateCreatorProfileCompletion(creator: Creator): number {
    const requiredFields = [creator.name, creator.email, creator.businessName];

    const optionalFields = [
      creator.phone,
      creator.profilePictureUrl,
      creator.businessDescription,
      creator.socialMediaLinks &&
        Object.keys(creator.socialMediaLinks).length > 0,
    ];

    const completedRequired = requiredFields.filter(
      (field) => field && field.trim() !== '',
    ).length;
    const completedOptional = optionalFields.filter((field) =>
      Boolean(field),
    ).length;

    // Required fields are worth 70%, optional fields 30%
    const requiredPercentage = (completedRequired / requiredFields.length) * 70;
    const optionalPercentage = (completedOptional / optionalFields.length) * 30;

    return Math.round(requiredPercentage + optionalPercentage);
  }
}
