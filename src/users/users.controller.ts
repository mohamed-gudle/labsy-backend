import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { UserRole } from './enums';
import {
  CustomerResponseDto,
  CreatorResponseDto,
  UpdateCustomerProfileDto,
  UpdateCreatorProfileDto,
} from './dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the authenticated user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getProfile(
    @CurrentUser() user: User,
  ): Promise<CustomerResponseDto | CreatorResponseDto> {
    return this.usersService.getProfile(user.id);
  }

  @Put('profile')
  @ApiOperation({
    summary: 'Update user profile',
    description:
      'Updates the authenticated user profile information based on their role',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateData: UpdateCustomerProfileDto | UpdateCreatorProfileDto,
  ): Promise<CustomerResponseDto | CreatorResponseDto> {
    if (user.role === UserRole.CUSTOMER) {
      return this.usersService.updateCustomerProfile(
        user.id,
        updateData as UpdateCustomerProfileDto,
      );
    } else if (user.role === UserRole.CREATOR) {
      return this.usersService.updateCreatorProfile(
        user.id,
        updateData as UpdateCreatorProfileDto,
      );
    }

    throw new Error('Invalid user role for profile update');
  }
}
