import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';
import { UserStatus } from '../../users/enums/user-status.enum';
import { Observable } from 'rxjs';

interface RequestWithUser extends Request {
  user?: User;
  decodedToken?: any;
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization header with Bearer token is required',
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    return this.validateToken(token, request);
  }

  private async validateToken(
    token: string,
    request: RequestWithUser,
  ): Promise<boolean> {
    try {
      const decodedToken = await this.authService.verifyFirebaseToken(token);

      // Fetch user from database
      const user = await this.authService.findUserByFirebaseUid(
        decodedToken.uid,
      );
      console.log('Decoded Token:', decodedToken);
      console.log('User from DB:', user);
      if (!user) {
        throw new UnauthorizedException('User not found in database');
      }

      // Check if user is active
      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('User account is not active');
      }

      // Attach user and decoded token to request
      request.user = user;
      request.decodedToken = decodedToken;

      return true;
    } catch (error) {
      console.log('Error during token validation:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
