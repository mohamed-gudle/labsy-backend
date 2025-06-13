import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, Factory, Admin } from '../users/entities';
import { UserRole, UserStatus } from '../users/enums';
import { AdminService } from './admin.service';
import { CreateFactoryDto, CreateAdminDto, UpdateUserStatusDto } from './dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('users/factory')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create factory account (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Factory account created successfully',
    type: Factory,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - user already exists',
  })
  async createFactory(
    @Body() createFactoryDto: CreateFactoryDto,
    @CurrentUser() adminUser: User,
  ): Promise<Factory> {
    return this.adminService.createFactory(createFactoryDto, adminUser);
  }

  @Post('users/admin')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create admin account (Super Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Admin account created successfully',
    type: Admin,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - super admin access required',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - user already exists',
  })
  async createAdmin(
    @Body() createAdminDto: CreateAdminDto,
    @CurrentUser() superAdminUser: User,
  ): Promise<Admin> {
    return this.adminService.createAdmin(createAdminDto, superAdminUser);
  }

  @Put('users/:id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user status (suspend/activate)' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'uuid-here',
  })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateUserStatus(
    @Param('id') userId: string,
    @Body() updateStatusDto: UpdateUserStatusDto,
    @CurrentUser() adminUser: User,
  ): Promise<User> {
    return this.adminService.updateUserStatus(
      userId,
      updateStatusDto,
      adminUser,
    );
  }

  @Delete('users/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Soft delete user account' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'uuid-here',
  })
  @ApiResponse({
    status: 200,
    description: 'User account deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'User account deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async deleteUser(
    @Param('id') userId: string,
    @CurrentUser() adminUser: User,
  ): Promise<{ message: string }> {
    await this.adminService.deleteUser(userId, adminUser);
    return { message: 'User account deleted successfully' };
  }

  @Get('users')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 20,
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: UserRole,
    description: 'Filter by user role',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: UserStatus,
    description: 'Filter by user status',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: { $ref: '#/components/schemas/User' },
        },
        total: {
          type: 'number',
          example: 150,
        },
        totalPages: {
          type: 'number',
          example: 8,
        },
        currentPage: {
          type: 'number',
          example: 1,
        },
        limit: {
          type: 'number',
          example: 20,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('role') role?: UserRole,
    @Query('status') status?: UserStatus,
  ): Promise<{
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  }> {
    const result = await this.adminService.getAllUsers(
      page,
      limit,
      role,
      status,
    );
    return {
      ...result,
      currentPage: page,
      limit,
    };
  }

  @Get('users/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'uuid-here',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserById(@Param('id') userId: string): Promise<User> {
    return this.adminService.getUserById(userId);
  }
}
