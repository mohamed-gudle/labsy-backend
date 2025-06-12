import {
  Injectable,
  OnModuleInit,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export interface FirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    try {
      // Initialize Firebase Admin SDK only if not already initialized
      if (!admin.apps.length) {
        const privateKey = this.configService
          .get<string>('FIREBASE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n');

        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
            clientEmail: this.configService.get<string>(
              'FIREBASE_CLIENT_EMAIL',
            ),
            privateKey,
          }),
        });

        this.logger.log('Firebase Admin SDK initialized successfully');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
      throw error;
    }
  }

  getAuth() {
    return admin.auth();
  }

  async verifyToken(token: string): Promise<FirebaseUser> {
    try {
      const decodedToken = await this.getAuth().verifyIdToken(token);

      return {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        emailVerified: decodedToken.email_verified || false,
        name: decodedToken.name as string | undefined,
        picture: decodedToken.picture,
      };
    } catch (error) {
      this.logger.error('Token verification failed', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getUserById(uid: string): Promise<FirebaseUser | null> {
    try {
      const userRecord = await this.getAuth().getUser(uid);

      return {
        uid: userRecord.uid,
        email: userRecord.email || '',
        emailVerified: userRecord.emailVerified,
        name: userRecord.displayName,
        picture: userRecord.photoURL,
      };
    } catch (error) {
      this.logger.error(`Failed to get user with UID: ${uid}`, error);
      return null;
    }
  }
}
