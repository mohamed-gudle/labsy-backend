import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { VerifyTokenDto, AuthResponseDto } from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @ApiOperation({
    summary: 'Get current user information',
    description: 'Returns the current authenticated user information',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: true,
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
  async getCurrentUser(
    @Headers('authorization') authorization?: string,
  ): Promise<AuthResponseDto> {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header is required');
    }

    // Extract token from "Bearer <token>" format
    const token = authorization.replace('Bearer ', '');
    if (!token || token === authorization) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    const user = await this.authService.verifyTokenAndSyncUser(token);

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
