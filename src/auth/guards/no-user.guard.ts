import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService, FirebaseUser } from '../auth.service';
import { Observable } from 'rxjs';

export interface RequestWithDecodedToken extends Request {
  decodedToken?: any;
  user?: FirebaseUser;
}

@Injectable()
export class NoUserGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithDecodedToken>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization header with Bearer token is required',
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    return this.validateTokenAndCheckNoUser(token, request);
  }

  private async validateTokenAndCheckNoUser(
    token: string,
    request: RequestWithDecodedToken,
  ): Promise<boolean> {
    try {
      const decodedToken = await this.authService.verifyFirebaseToken(token);

      // Check if user already exists in database
      const existingUser = await this.authService.findUserByFirebaseUid(
        decodedToken.uid,
      );

      if (existingUser) {
        throw new ConflictException('User already registered');
      }

      // Attach decoded token and Firebase user to request for use in controllers
      request.decodedToken = decodedToken;
      request.user = {
        uid: decodedToken.uid,
        email: decodedToken.email as string,
        emailVerified: decodedToken.email_verified as boolean,
        name: decodedToken.name,
        picture: decodedToken.picture,
      };

      return true;
    } catch (error) {
      console.log('Error during token validation:', error);
      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
