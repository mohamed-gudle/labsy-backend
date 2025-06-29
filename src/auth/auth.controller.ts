import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateCreatorDto,
  CreateCustomerDto,
  CreatorResponseDto,
  CustomerResponseDto,
} from '../users/dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService, FirebaseUser } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { FirebaseUserDec } from './decorators/firebase-user.decorator';
import {
  AuthResponseDto,
  CompletePendingRegistrationDto,
  VerifyTokenDto,
} from './dto';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { NoUserGuard } from './guards/no-user.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('verify')
  @ApiOperation({
    summary: 'Verify Firebase token and sync user',
    description:
      'Verifies a Firebase ID token and creates/updates the user in the local database',
  })
  @ApiResponse({
    status: 200,
    description: 'Token verified successfully and user synced',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired token',
  })
  async verifyToken(
    @Body() verifyTokenDto: VerifyTokenDto,
  ): Promise<AuthResponseDto> {
    const user = await this.authService.verifyTokenAndSyncUser(
      verifyTokenDto.token,
    );

    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      profilePictureUrl: user.profilePictureUrl,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user information',
    description: 'Returns the current authenticated user information',
  })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  getCurrentUser(@CurrentUser() user: User): AuthResponseDto {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      profilePictureUrl: user.profilePictureUrl,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Post('register/customer')
  @ApiOperation({
    summary: 'Register a new customer',
    description:
      'Registers a new customer account using Firebase authentication',
  })
  @ApiResponse({
    status: 201,
    description: 'Customer registered successfully',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or email mismatch',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired Firebase token',
  })
  @ApiResponse({
    status: 409,
    description: 'User already registered',
  })
  async registerCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    return this.usersService.registerCustomer(createCustomerDto);
  }

  @Post('register/creator')
  @UseGuards(NoUserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Register a new creator',
    description:
      'Registers a new creator account using Firebase authentication',
  })
  @ApiResponse({
    status: 201,
    description: 'Creator registered successfully',
    type: CreatorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or email mismatch',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired Firebase token',
  })
  @ApiResponse({
    status: 409,
    description: 'User already registered',
  })
  async registerCreator(
    @Body() createCreatorDto: CreateCreatorDto,
    @FirebaseUserDec() user: FirebaseUser,
  ): Promise<CreatorResponseDto> {
    return this.usersService.registerCreator(createCreatorDto, user);
  }

  @Post('complete-registration')
  @ApiOperation({
    summary: 'Complete pending registration',
    description:
      'Complete account registration for users invited by admins (factories and admins)',
  })
  @ApiResponse({
    status: 200,
    description: 'Registration completed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or email mismatch',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired Firebase token',
  })
  @ApiResponse({
    status: 404,
    description: 'No pending invitation found for this email',
  })
  async completePendingRegistration(
    @Body() completePendingRegistrationDto: CompletePendingRegistrationDto,
  ): Promise<AuthResponseDto> {
    const user = await this.authService.completePendingRegistration(
      completePendingRegistrationDto.token,
      completePendingRegistrationDto.email,
    );

    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      profilePictureUrl: user.profilePictureUrl,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
