import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsArray,
} from 'class-validator';

export enum AdminRole {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  SUPPORT = 'support',
}

export enum AdminPermission {
  USER_MANAGEMENT = 'user-management',
  FACTORY_MANAGEMENT = 'factory-management',
  PRODUCT_MANAGEMENT = 'product-management',
  ORDER_MANAGEMENT = 'order-management',
  ANALYTICS_ACCESS = 'analytics-access',
  SYSTEM_CONFIGURATION = 'system-configuration',
  AUDIT_LOGS = 'audit-logs',
  SUPPORT_TICKETS = 'support-tickets',
}

export class CreateAdminDto {
  @ApiProperty({
    description: 'Admin name',
    example: 'Ahmed Al-Rashid',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@labsy.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Admin contact phone number',
    example: '+966501234567',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Admin role level',
    enum: AdminRole,
    example: AdminRole.ADMIN,
  })
  @IsNotEmpty()
  @IsEnum(AdminRole)
  adminRole: AdminRole;

  @ApiPropertyOptional({
    description: 'Specific permissions for this admin',
    enum: AdminPermission,
    isArray: true,
    example: [
      AdminPermission.USER_MANAGEMENT,
      AdminPermission.ORDER_MANAGEMENT,
    ],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AdminPermission, { each: true })
  permissions?: AdminPermission[];

  @ApiPropertyOptional({
    description: 'Department or team the admin belongs to',
    example: 'Customer Support',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({
    description: 'Admin job title',
    example: 'Customer Support Manager',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle?: string;

  @ApiPropertyOptional({
    description: 'Employee ID or reference number',
    example: 'EMP001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  employeeId?: string;

  @ApiPropertyOptional({
    description: 'Admin notes or description',
    example: 'Responsible for handling customer inquiries and order support',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
