import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { VerifyTokenDto, AuthResponseDto } from './dto';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import {
  CreateCustomerDto,
  CreateCreatorDto,
  CustomerResponseDto,
  CreatorResponseDto,
} from '../users/dto';

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
  ): Promise<CreatorResponseDto> {
    return this.usersService.registerCreator(createCreatorDto);
  }
}
