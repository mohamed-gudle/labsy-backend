## Relevant Files

- `src/auth/auth.module.ts` - Main authentication module configuration and imports ✓
- `src/auth/auth.controller.ts` - Authentication endpoints and token verification ✓
- `src/auth/auth.service.ts` - Firebase integration and user synchronization logic ✓
- `src/auth/guards/firebase-auth.guard.ts` - Firebase token verification guard
- `src/auth/guards/roles.guard.ts` - Role-based authorization guard
- `src/auth/decorators/current-user.decorator.ts` - Decorator to inject current user
- `src/auth/decorators/roles.decorator.ts` - Decorator for role-based access control
- `src/users/users.module.ts` - User management module configuration ✓
- `src/users/users.controller.ts` - User profile and management endpoints
- `src/users/users.service.ts` - User business logic and database operations
- `src/users/entities/user.entity.ts` - Base user entity with common fields ✓
- `src/users/entities/customer.entity.ts` - Customer-specific profile entity ✓
- `src/users/entities/creator.entity.ts` - Creator-specific profile entity ✓
- `src/users/entities/factory.entity.ts` - Factory-specific profile entity ✓
- `src/users/entities/admin.entity.ts` - Admin-specific profile entity ✓
- `src/users/dto/create-user.dto.ts` - DTOs for user creation validation
- `src/users/dto/update-profile.dto.ts` - DTOs for profile update validation
- `src/users/dto/user-response.dto.ts` - Response DTOs for user data
- `src/uploads/uploads.module.ts` - File upload module for profile pictures
- `src/uploads/uploads.controller.ts` - File upload endpoints
- `src/uploads/uploads.service.ts` - Google Cloud Storage integration
- `src/admin/admin.module.ts` - Admin-only functionality module
- `src/admin/admin.controller.ts` - Admin user management endpoints
- `src/admin/admin.service.ts` - Admin business logic
- `src/auth/auth.controller.spec.ts` - Unit tests for auth controller
- `src/auth/auth.service.spec.ts` - Unit tests for auth service
- `src/users/users.controller.spec.ts` - Unit tests for users controller
- `src/users/users.service.spec.ts` - Unit tests for users service
- `src/uploads/uploads.service.spec.ts` - Unit tests for uploads service
- `src/admin/admin.controller.spec.ts` - Unit tests for admin controller

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `auth.service.ts` and `auth.service.spec.ts` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- Use nest cli to generate files, e.g., `nest g resource auth` or `nest g controller auth`.
- Install required dependencies: `yarn add firebase-admin @google-cloud/storage class-validator class-transformer @nestjs/swagger @nestjs/typeorm @nestjs/config`

## Tasks

- [ ] 1.0 Set up Authentication Module and Firebase Integration  - [x] 1.1 Install required dependencies: `yarn add firebase-admin @google-cloud/storage class-validator class-transformer @nestjs/swagger @nestjs/typeorm @nestjs/config`  - [x] 1.2 Generate auth module using NestJS CLI: `nest g module auth`  - [x] 1.3 Generate auth controller: `nest g controller auth`  - [x] 1.4 Generate auth service: `nest g service auth`  - [x] 1.5 Configure Firebase Admin SDK in auth service with environment variables  - [x] 1.6 Create Firebase token verification method in auth service  - [x] 1.7 Implement user synchronization logic between Firebase and local database  - [x] 1.8 Add environment variables for Firebase configuration to .env file  - [x] 1.9 Create auth endpoints: `POST /auth/verify` and `GET /auth/me`
  - [x] 1.10 Add Swagger documentation decorators to auth endpoints
  - [ ] 1.11 Write unit tests for auth service Firebase integration
  - [ ] 1.12 Write unit tests for auth controller endpoints

- [x] 2.0 Implement User Entities and Database Schema  - [x] 2.1 Generate users module: `nest g module users`  - [x] 2.2 Create base User entity with common fields (id, firebaseUid, email, name, role, status, timestamps)
  - [x] 2.3 Create Customer entity extending User with customer-specific fields (phone, preferredLanguage, shippingAddresses)
  - [x] 2.4 Create Creator entity extending User with creator-specific fields (businessName, businessDescription, socialMediaLinks)
  - [x] 2.5 Create Factory entity extending User with factory-specific fields (location, capabilities)
  - [x] 2.6 Create Admin entity extending User with admin-specific fields
  - [x] 2.7 Define proper TypeORM relationships and constraints between entities
  - [x] 2.8 Create enum for UserRole (CUSTOMER, CREATOR, FACTORY, ADMIN)
  - [x] 2.9 Create enum for UserStatus (ACTIVE, SUSPENDED, DELETED)
  - [x] 2.10 Add soft delete functionality to User entity (@DeleteDateColumn)
  - [x] 2.11 Configure TypeORM in users module to register all entities

- [x] 3.0 Create Role-Based Authorization System
  - [x] 3.1 Create firebase-auth.guard.ts for token verification
  - [x] 3.2 Create roles.guard.ts for role-based access control
  - [x] 3.3 Create @CurrentUser() decorator to inject authenticated user
  - [x] 3.4 Create @Roles() decorator for endpoint role restrictions
  - [x] 3.5 Implement guard logic to verify Firebase tokens and fetch user from database
  - [x] 3.6 Implement guard logic to check user roles and permissions
  - [x] 3.7 Add error handling for invalid tokens and unauthorized access
  - [x] 3.8 Create custom exception filters for authentication errors
  - [x] 3.9 Write unit tests for firebase-auth.guard
  - [x] 3.10 Write unit tests for roles.guard
  - [x] 3.11 Write unit tests for custom decorators

- [ ] 4.0 Build User Registration and Profile Management
  - [ ] 4.1 Generate users controller: `nest g controller users`
  - [ ] 4.2 Generate users service: `nest g service users`
  - [ ] 4.3 Create DTOs for customer registration (CreateCustomerDto)
  - [ ] 4.4 Create DTOs for creator registration (CreateCreatorDto)
  - [ ] 4.5 Create DTOs for profile updates (UpdateCustomerProfileDto, UpdateCreatorProfileDto)
  - [ ] 4.6 Create response DTOs for user data (UserResponseDto, CustomerResponseDto, CreatorResponseDto)
  - [ ] 4.7 Implement registration endpoints: `POST /auth/register/customer` and `POST /auth/register/creator`
  - [ ] 4.8 Implement profile management endpoints: `GET /users/profile` and `PUT /users/profile`
  - [ ] 4.9 Add validation logic for role-specific profile fields
  - [ ] 4.10 Implement profile completion percentage calculation
  - [ ] 4.11 Generate uploads module for profile pictures: `nest g module uploads`
  - [ ] 4.12 Create Google Cloud Storage service for file uploads
  - [ ] 4.13 Implement profile picture upload endpoint: `POST /users/profile/picture`
  - [ ] 4.14 Implement profile picture delete endpoint: `DELETE /users/profile/picture`
  - [ ] 4.15 Add file validation (size limits, formats) for profile pictures
  - [ ] 4.16 Write unit tests for users service methods
  - [ ] 4.17 Write unit tests for users controller endpoints
  - [ ] 4.18 Write unit tests for uploads service

- [ ] 5.0 Implement Admin User Management Features
  - [ ] 5.1 Generate admin module: `nest g module admin`
  - [ ] 5.2 Generate admin controller: `nest g controller admin`
  - [ ] 5.3 Generate admin service: `nest g service admin`
  - [ ] 5.4 Create DTOs for factory account creation (CreateFactoryDto)
  - [ ] 5.5 Create DTOs for admin account creation (CreateAdminDto)
  - [ ] 5.6 Create DTOs for user status updates (UpdateUserStatusDto)
  - [ ] 5.7 Implement factory creation endpoint: `POST /admin/users/factory`
  - [ ] 5.8 Implement admin creation endpoint: `POST /admin/users/admin`
  - [ ] 5.9 Implement user status management: `PUT /admin/users/:id/status`
  - [ ] 5.10 Implement soft delete endpoint: `DELETE /admin/users/:id`
  - [ ] 5.11 Add audit logging for all admin actions
  - [ ] 5.12 Implement user listing and search functionality for admins
  - [ ] 5.13 Add role-based guards to restrict admin endpoints to ADMIN role only
  - [ ] 5.14 Write unit tests for admin service methods
  - [ ] 5.15 Write unit tests for admin controller endpoints
  - [ ] 5.16 Create integration tests for end-to-end admin workflows
