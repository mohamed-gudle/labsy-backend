import { NestFactory } from '@nestjs/core';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { AppModule } from '../app.module';
import { User, Admin } from '../users/entities';
import { UserRole, UserStatus } from '../users/enums';
import { AdminPermission } from '../admin/dto';

/**
 * Seed script to create the first super admin
 * This should only be run once during initial setup
 *
 * Usage: npx ts-node src/seeds/create-super-admin.seed.ts
 */
async function createSuperAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    const configService = app.get(ConfigService);

    // Check if any admin already exists
    const existingAdminCount = await userRepository.count({
      where: { role: UserRole.ADMIN },
    });

    if (existingAdminCount > 0) {
      console.log('❌ Super admin already exists. Exiting...');
      process.exit(1);
    }

    // Initialize Firebase Admin SDK if not already initialized
    if (!admin.apps.length) {
      const privateKey = configService
        .get<string>('FIREBASE_PRIVATE_KEY')
        ?.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
          clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
          privateKey,
        }),
      });
    }

    // Prompt for admin details
    console.log('🚀 Creating Super Admin...\n');

    // You can modify these values or make them environment variables
    const superAdminData = {
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@labsy.com',
      name: process.env.SUPER_ADMIN_NAME || 'Super Administrator',
      phone: process.env.SUPER_ADMIN_PHONE,
      department: 'Administration',
      position: 'Super Administrator',
    };

    console.log('📧 Super Admin Email:', superAdminData.email);
    console.log('👤 Super Admin Name:', superAdminData.name);

    // Check if Firebase user exists
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUserByEmail(superAdminData.email);
      console.log('✅ Firebase user found');
    } catch (error) {
      console.log(
        '❌ Firebase user not found. Please create the user in Firebase Console first.',
      );
      console.log(`   1. Go to Firebase Console > Authentication > Users`);
      console.log(`   2. Add user with email: ${superAdminData.email}`);
      console.log(`   3. Make sure email is verified`);
      console.log(`   4. Run this script again`);
      process.exit(1);
    }

    // Check if user already exists in local database
    const existingUser = await userRepository.findOne({
      where: { firebaseUid: firebaseUser.uid },
    });

    if (existingUser) {
      console.log('❌ User already exists in local database');
      process.exit(1);
    }

    // Generate employee ID
    const generateEmployeeId = (): string => {
      const prefix = 'EMP';
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
      return `${prefix}${timestamp.slice(-6)}${random}`;
    };

    // Create super admin
    const superAdmin = new Admin();
    superAdmin.firebaseUid = firebaseUser.uid;
    superAdmin.email = firebaseUser.email!;
    superAdmin.name = superAdminData.name;
    superAdmin.role = UserRole.ADMIN; // Use the enum instead of string casting
    superAdmin.status = UserStatus.ACTIVE;
    superAdmin.emailVerified = firebaseUser.emailVerified;
    superAdmin.profilePictureUrl = firebaseUser.photoURL || undefined;

    // Set super admin specific fields
    superAdmin.phone = superAdminData.phone;
    superAdmin.adminLevel = 'super_admin';
    superAdmin.permissions = Object.values(AdminPermission).map((p) =>
      p.toString(),
    );
    superAdmin.department = superAdminData.department;
    superAdmin.position = superAdminData.position;
    superAdmin.employeeId = generateEmployeeId();
    superAdmin.twoFactorEnabled = false;

    // Save to database
    console.log('🔄 Saving Super Admin to database...');
    console.log(superAdmin);
    const savedAdmin = await userRepository.save(superAdmin);

    console.log('\n✅ Super Admin created successfully!');
    console.log('📊 Details:');
    console.log(`   ID: ${savedAdmin.id}`);
    console.log(`   Email: ${savedAdmin.email}`);
    console.log(`   Name: ${savedAdmin.name}`);
    console.log(`   Employee ID: ${savedAdmin.employeeId}`);
    console.log(`   Admin Level: ${savedAdmin.adminLevel}`);
    console.log(
      `   Permissions: ${savedAdmin.permissions.length} permissions assigned`,
    );
    console.log(
      '\n🎉 You can now log in and create other admins and factories!',
    );
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Run the seed script
createSuperAdmin().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
