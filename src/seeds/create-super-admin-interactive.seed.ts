/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as readline from 'readline';
import { AppModule } from '../app.module';
import { User, Admin } from '../users/entities';
import { UserRole, UserStatus } from '../users/enums';
import { AdminPermission } from '../admin/dto';

/**
 * Interactive seed script to create the first super admin
 * This should only be run once during initial setup
 *
 * Usage: npx ts-node src/seeds/create-super-admin-interactive.seed.ts
 */

interface SuperAdminInput {
  email: string;
  name: string;
  phone?: string;
  department?: string;
  position?: string;
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function getSuperAdminDetails(): Promise<SuperAdminInput> {
  console.log('🚀 Super Admin Setup - Please provide the following details:\n');

  const email = await askQuestion('📧 Email address: ');
  if (!email || !email.includes('@')) {
    throw new Error('Valid email address is required');
  }

  const name = await askQuestion('👤 Full name: ');
  if (!name) {
    throw new Error('Name is required');
  }

  const phone = await askQuestion('📱 Phone number (optional): ');
  const department =
    (await askQuestion('🏢 Department (default: Administration): ')) ||
    'Administration';
  const position =
    (await askQuestion('💼 Position (default: Super Administrator): ')) ||
    'Super Administrator';

  return {
    email,
    name,
    phone: phone || undefined,
    department,
    position,
  };
}

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
      rl.close();
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

    // Get admin details from user input
    const superAdminData = await getSuperAdminDetails();

    console.log('\n📋 Summary:');
    console.log(`Email: ${superAdminData.email}`);
    console.log(`Name: ${superAdminData.name}`);
    console.log(`Phone: ${superAdminData.phone || 'Not provided'}`);
    console.log(`Department: ${superAdminData.department}`);
    console.log(`Position: ${superAdminData.position}`);

    const confirm = await askQuestion(
      '\n✅ Create super admin with these details? (y/N): ',
    );
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      rl.close();
      process.exit(0);
    }

    console.log('\n🔍 Checking Firebase user...');

    // Check if Firebase user exists
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUserByEmail(superAdminData.email);
      console.log('✅ Firebase user found');
    } catch (error) {
      console.log(
        '❌ Firebase user not found. Please create the user in Firebase Console first.',
      );
      console.log('\n📝 Steps to create Firebase user:');
      console.log(`   1. Go to Firebase Console > Authentication > Users`);
      console.log(`   2. Click "Add user"`);
      console.log(`   3. Enter email: ${superAdminData.email}`);
      console.log(`   4. Set a temporary password`);
      console.log(`   5. Make sure to verify the email`);
      console.log(`   6. Run this script again`);
      rl.close();
      process.exit(1);
    }

    // Check if user already exists in local database
    const existingUser = await userRepository.findOne({
      where: { firebaseUid: firebaseUser.uid },
    });

    if (existingUser) {
      console.log('❌ User already exists in local database');
      rl.close();
      process.exit(1);
    }

    console.log('💾 Creating super admin in database...');

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
    superAdmin.role = UserRole.ADMIN; // Use the enum directly
    superAdmin.status = UserStatus.ACTIVE;
    superAdmin.emailVerified = firebaseUser.emailVerified;
    superAdmin.profilePictureUrl = firebaseUser.photoURL ?? undefined;

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

    // Default admin settings
    superAdmin.adminSettings = {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      notificationPreferences: {
        email: true,
        browser: true,
        mobile: true,
      },
    };

    // Save to database
    const savedAdmin = await userRepository.save(superAdmin);

    console.log('\n🎉 Super Admin created successfully!');
    console.log('\n📊 Admin Details:');
    console.log(`   ID: ${savedAdmin.id}`);
    console.log(`   Firebase UID: ${savedAdmin.firebaseUid}`);
    console.log(`   Email: ${savedAdmin.email}`);
    console.log(`   Name: ${savedAdmin.name}`);
    console.log(`   Employee ID: ${savedAdmin.employeeId}`);
    console.log(`   Admin Level: ${savedAdmin.adminLevel}`);
    console.log(`   Department: ${savedAdmin.department}`);
    console.log(`   Position: ${savedAdmin.position}`);
    console.log(
      `   Permissions: ${savedAdmin.permissions.length} permissions assigned`,
    );
    console.log(`   Email Verified: ${savedAdmin.emailVerified ? '✅' : '❌'}`);

    console.log('\n🔐 Next Steps:');
    console.log(`   1. The super admin can now log in using Firebase Auth`);
    console.log(
      `   2. Use the admin endpoints to create other admins and factories`,
    );
    console.log(`   3. Consider enabling 2FA for enhanced security`);

    if (!savedAdmin.emailVerified) {
      console.log(
        '\n⚠️  Warning: Email is not verified in Firebase. Please verify it for security.',
      );
    }
  } catch (error) {
    console.error('\n❌ Error creating super admin:', error);
    rl.close();
    process.exit(1);
  } finally {
    rl.close();
    await app.close();
  }
}

// Run the seed script
createSuperAdmin().catch((error) => {
  console.error('❌ Fatal error:', error);
  rl.close();
  process.exit(1);
});
