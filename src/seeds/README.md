# Admin Seeding Guide

This guide explains how to create the first super admin for your Labsy backend application.

## The Problem

The admin module requires an existing super admin to create other admins, which creates a chicken-and-egg problem. These seed scripts solve this by allowing you to bootstrap the first super admin.

## Prerequisites

1. **Firebase Project Setup**: Make sure your Firebase project is configured and your environment variables are set in `.env`:
   ```bash
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_PRIVATE_KEY=your-private-key
   ```

2. **Database**: Ensure your PostgreSQL database is running and migrations have been executed:
   ```bash
   yarn migration:run
   ```

## Option 1: Environment Variables (Automated)

Use this method for development/staging environments where you can set environment variables.

### Setup Environment Variables

Add these to your `.env` file:
```bash
SUPER_ADMIN_EMAIL=admin@labsy.com
SUPER_ADMIN_NAME=Super Administrator
SUPER_ADMIN_PHONE=+966501234567  # Optional
```

### Create Firebase User

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to Authentication > Users
3. Click "Add user"
4. Enter the email from `SUPER_ADMIN_EMAIL`
5. Set a secure password
6. Make sure to verify the email

### Run the Seed Script

```bash
yarn seed:super-admin
```

## Option 2: Interactive Setup (Recommended)

Use this method for production environments or when you want to customize the admin details.

### Create Firebase User First

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to Authentication > Users
3. Click "Add user"
4. Enter your desired admin email
5. Set a secure password
6. **Important**: Verify the email address

### Run the Interactive Seed Script

```bash
yarn seed:super-admin:interactive
```

The script will prompt you for:
- Email address (must match the Firebase user)
- Full name
- Phone number (optional)
- Department (defaults to "Administration")
- Position (defaults to "Super Administrator")

### Example Session

```bash
$ yarn seed:super-admin:interactive

🚀 Super Admin Setup - Please provide the following details:

📧 Email address: admin@labsy.com
👤 Full name: Ahmed Al-Rashid
📱 Phone number (optional): +966501234567
🏢 Department (default: Administration): Administration
💼 Position (default: Super Administrator): Super Administrator

📋 Summary:
Email: admin@labsy.com
Name: Ahmed Al-Rashid
Phone: +966501234567
Department: Administration
Position: Super Administrator

✅ Create super admin with these details? (y/N): y

🔍 Checking Firebase user...
✅ Firebase user found
💾 Creating super admin in database...

🎉 Super Admin created successfully!

📊 Admin Details:
   ID: 123e4567-e89b-12d3-a456-426614174000
   Firebase UID: firebase-uid-123
   Email: admin@labsy.com
   Name: Ahmed Al-Rashid
   Employee ID: EMP123456789
   Admin Level: super_admin
   Department: Administration
   Position: Super Administrator
   Permissions: 8 permissions assigned
   Email Verified: ✅

🔐 Next Steps:
   1. The super admin can now log in using Firebase Auth
   2. Use the admin endpoints to create other admins and factories
   3. Consider enabling 2FA for enhanced security
```

## What the Script Does

1. **Validates Prerequisites**: Checks that no admin exists yet
2. **Verifies Firebase User**: Ensures the user exists in Firebase Authentication
3. **Creates Admin Record**: Creates a complete admin record in your PostgreSQL database with:
   - All super admin permissions
   - Unique employee ID
   - Proper admin level (`super_admin`)
   - Default settings and preferences

## After Creating the Super Admin

Once the super admin is created, you can:

1. **Log in via your frontend** using the Firebase credentials
2. **Use admin endpoints** to create other admins:
   ```bash
   POST /admin/users/admin
   ```
3. **Create factory accounts**:
   ```bash
   POST /admin/users/factory
   ```
4. **Manage users** through the admin panel

## Permissions Granted

The super admin automatically receives all available permissions:
- `user-management`
- `factory-management`
- `product-management`
- `order-management`
- `analytics-access`
- `system-configuration`
- `audit-logs`
- `support-tickets`

## Security Notes

- ⚠️ **Only run these scripts once** during initial setup
- ⚠️ **Verify the Firebase email** before running the script
- ⚠️ **Use strong passwords** for the Firebase account
- ⚠️ **Consider enabling 2FA** after the admin is created
- ⚠️ **Delete or secure these scripts** in production

## Troubleshooting

### "Firebase user not found"
- Make sure you created the user in Firebase Console
- Verify the email address matches exactly
- Check that your Firebase credentials are correct in `.env`

### "Super admin already exists"
- This is expected if you've already run the script
- Use the admin endpoints to create additional admins

### "User already exists in local database"
- The Firebase user is already registered in your system
- Check the users table in your database

### Permission errors
- Make sure your Firebase service account has the necessary permissions
- Verify your `.env` file has the correct Firebase credentials

## Alternative: Manual Database Insert

If the scripts don't work, you can manually insert the super admin record into your database. Contact your database administrator for assistance.
