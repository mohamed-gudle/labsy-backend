/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as admin from 'firebase-admin';
import { Repository } from 'typeorm';
import { Admin, Creator, Customer, Factory, User } from '../users/entities';
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
    role: UserRole = UserRole.CUSTOMER,
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
      const actualRole = role;
      this.logger.log(`Creating new user with role: ${actualRole}`);

      let newUser: User;

      switch (actualRole) {
        case UserRole.CUSTOMER:
          newUser = new Customer();
          break;
        case UserRole.CREATOR:
          newUser = new Creator();
          break;
        case UserRole.FACTORY:
          newUser = new Factory();
          break;
        case UserRole.ADMIN:
          newUser = new Admin();
          break;
        default:
          throw new UnauthorizedException(`Invalid user role: ${actualRole}`);
      }

      // Set common properties for all user types
      newUser.firebaseUid = firebaseUser.uid;
      newUser.email = firebaseUser.email;
      newUser.name = firebaseUser.name;
      newUser.status = UserStatus.ACTIVE;
      newUser.emailVerified = firebaseUser.emailVerified;
      newUser.profilePictureUrl = firebaseUser.picture;
      newUser.lastLoginAt = new Date();

      this.logger.log(`New ${actualRole} user: ${JSON.stringify(newUser)}`);

      user = await this.userRepository.save(newUser);
      this.logger.log(
        `Created new user: ${user.id} (${user.email}), role: ${user.role}`,
      );

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
