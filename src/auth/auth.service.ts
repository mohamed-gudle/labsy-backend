import {
  Injectable,
  OnModuleInit,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import { User } from '../users/entities';
import { UserRole, UserStatus } from '../users/enums';

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

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

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

  async findOrCreateUser(
    firebaseUser: FirebaseUser,
    role?: UserRole,
  ): Promise<User> {
    try {
      // Try to find existing user by Firebase UID
      let user = await this.userRepository.findOne({
        where: { firebaseUid: firebaseUser.uid },
      });

      if (user) {
        // Update existing user with latest Firebase info
        user.email = firebaseUser.email;
        user.name = firebaseUser.name || user.name;
        user.emailVerified = firebaseUser.emailVerified;
        user.profilePictureUrl = firebaseUser.picture || user.profilePictureUrl;
        user.lastLoginAt = new Date();

        return await this.userRepository.save(user);
      }

      // Create new user if not found
      const newUser = this.userRepository.create({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.name,
        role: role || UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        emailVerified: firebaseUser.emailVerified,
        profilePictureUrl: firebaseUser.picture,
        lastLoginAt: new Date(),
      });

      user = await this.userRepository.save(newUser);
      this.logger.log(`Created new user: ${user.id} (${user.email})`);

      return user;
    } catch (error) {
      this.logger.error('Failed to find or create user', error);
      throw error;
    }
  }

  async syncUserFromFirebase(firebaseUid: string): Promise<User | null> {
    try {
      const firebaseUser = await this.getUserById(firebaseUid);
      if (!firebaseUser) {
        return null;
      }

      return await this.findOrCreateUser(firebaseUser);
    } catch (error) {
      this.logger.error(
        `Failed to sync user from Firebase: ${firebaseUid}`,
        error,
      );
      return null;
    }
  }

  async verifyTokenAndSyncUser(token: string): Promise<User> {
    try {
      // Verify the Firebase token
      const firebaseUser = await this.verifyToken(token);

      // Find or create the user in local database
      const user = await this.findOrCreateUser(firebaseUser);

      return user;
    } catch (error) {
      this.logger.error('Token verification and user sync failed', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { firebaseUid },
      });
    } catch (error) {
      this.logger.error(
        `Failed to get user by Firebase UID: ${firebaseUid}`,
        error,
      );
      return null;
    }
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    try {
      await this.userRepository.update(userId, {
        lastLoginAt: new Date(),
      });
    } catch (error) {
      this.logger.error(
        `Failed to update last login for user: ${userId}`,
        error,
      );
    }
  }
}
