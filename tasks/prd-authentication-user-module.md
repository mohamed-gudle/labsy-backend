# Product Requirements Document: Authentication and User Module

## Introduction/Overview

The Authentication and User Module provides secure user management for the Labsy print-on-demand platform. This feature enables user registration, profile management, and role-based authorization while leveraging Firebase for authentication and token management. The system supports four distinct user types: Customers, Creators, Factories, and Admins, each with specific permissions and profile requirements.

**Problem Solved:** Establishes a secure, scalable authentication system that supports different user roles with appropriate access controls for a localized Middle Eastern POD platform.

**Goal:** Implement a comprehensive authentication and user management system that integrates Firebase Auth with NestJS backend for profile management and authorization.

## Goals

1. **Secure Authentication:** Integrate Firebase Auth for user authentication with email verification
2. **Role-Based Authorization:** Implement role-based access control following the principle of least privilege
3. **User Profile Management:** Enable users to manage their profiles with role-specific fields
4. **Account Security:** Implement MFA, account suspension, and soft delete capabilities
5. **Seamless Integration:** Ensure smooth token verification and user synchronization between Firebase and the backend
6. **Admin Controls:** Provide admin-only capabilities for managing Factory and Admin accounts

## User Stories

### As a Customer:
- I want to register with my email and complete email verification so that I can access the platform securely
- I want to update my profile information including shipping addresses so that I can manage my orders effectively
- I want to upload a profile picture so that I can personalize my account
- I want to enable MFA so that my account is more secure

### As a Creator:
- I want to register as a Creator and complete email verification so that I can start selling products
- I want to manage my Creator profile with business information so that customers can learn about my brand
- I want to update my payment and payout information so that I can receive earnings

### As a Factory:
- I want to access my factory dashboard so that I can manage production orders
- I want to update my factory profile and capabilities so that the system can route appropriate orders to me

### As an Admin:
- I want to create Factory and Admin accounts so that I can onboard new partners and team members
- I want to suspend or deactivate user accounts so that I can manage platform security
- I want to view and manage all user profiles so that I can provide customer support
- I want to assign and modify user roles so that I can manage access permissions

## Functional Requirements

### Authentication (Firebase Integration)
1. The system must verify Firebase ID tokens for all authenticated requests
2. The system must synchronize user data between Firebase and the local database upon first login
3. The system must handle token expiration gracefully and return appropriate error responses
4. The system must support email verification through Firebase Auth
5. The system must support MFA setup and verification through Firebase Auth

### User Registration
6. The system must allow self-registration for Customer and Creator user types
7. The system must require email verification before allowing full platform access
8. The system must collect role-specific information during registration:
   - **Customer:** Name, email, phone, preferred language, shipping addresses
   - **Creator:** Name, email, phone, business name, business description, social media links
9. The system must prevent registration of Factory and Admin accounts through public endpoints
10. The system must create a local user record upon successful Firebase registration

### User Profile Management
11. The system must allow users to view their complete profile information
12. The system must allow users to update their profile fields appropriate to their role
13. The system must support profile picture upload to Google Cloud Storage
14. The system must validate profile updates according to role-specific rules
15. The system must track profile completion percentage to encourage complete profiles

### Role-Based Authorization
16. The system must implement role-based access control with the following permissions:
    - **Customer:** View products, manage orders, update own profile
    - **Creator:** Manage own products, view own sales analytics, update creator profile
    - **Factory:** View assigned orders, update production status, manage factory profile
    - **Admin:** Full system access, user management, system configuration
17. The system must use guards and decorators to protect endpoints based on user roles
18. The system must deny access to unauthorized endpoints with appropriate error messages

### Account Management
19. The system must allow admins to create Factory and Admin accounts
20. The system must allow admins to suspend/activate user accounts
21. The system must implement soft delete for user accounts (mark as deleted, don't remove data)
22. The system must prevent deleted users from accessing the platform
23. The system must log all account status changes for audit purposes

### User Data Synchronization
24. The system must query existing users by Firebase UID when tokens are verified
25. The system must create new user records for first-time Firebase users
26. The system must return "user_not_found" status for unregistered Firebase users to trigger frontend registration flow
27. The system must update last login timestamp on successful authentication

## Non-Goals (Out of Scope)

1. **Password Management:** Password reset, change password (handled by Firebase)
2. **Social Media Login:** OAuth with Google, Facebook, etc. (can be added later)
3. **User Analytics:** Detailed user behavior tracking and analytics
4. **Advanced MFA:** Custom MFA implementations beyond Firebase's offerings
5. **User Communication:** In-app messaging, notifications (separate module)
6. **Payment Information:** Credit card storage, payment processing (separate module)

## Design Considerations

### Database Schema
- Follow the provided database diagram with User, Creator, Customer, Factory, and Admin entities
- Implement proper foreign key relationships and constraints
- Use UUID for primary keys to enhance security
- Include timestamps for created_at, updated_at, deleted_at (soft delete)

### API Design
- Use DTOs for request/response validation and transformation
- Implement proper error handling with standardized error responses
- Use Swagger decorators for API documentation
- Follow RESTful conventions for endpoint design

### Security Considerations
- Validate all Firebase tokens on every authenticated request
- Implement rate limiting for sensitive endpoints
- Sanitize and validate all user inputs
- Use HTTPS for all API communications
- Store sensitive data (like profile pictures) securely in Google Cloud Storage

## Technical Considerations

### Dependencies
- `@nestjs/typeorm` for database interactions
- `class-validator` and `class-transformer` for DTOs
- `firebase-admin` SDK for token verification
- `@google-cloud/storage` for file uploads
- `@nestjs/swagger` for API documentation

### Module Structure
```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── guards/
│   │   ├── firebase-auth.guard.ts
│   │   └── roles.guard.ts
│   └── decorators/
│       ├── current-user.decorator.ts
│       └── roles.decorator.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── creator.entity.ts
│   │   ├── customer.entity.ts
│   │   ├── factory.entity.ts
│   │   └── admin.entity.ts
│   └── dto/
│       ├── create-user.dto.ts
│       ├── update-profile.dto.ts
│       └── user-response.dto.ts
└── uploads/
    ├── uploads.module.ts
    ├── uploads.controller.ts
    └── uploads.service.ts
```

### Environment Variables
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `GOOGLE_CLOUD_STORAGE_BUCKET`

## Success Metrics

1. **Security:** Zero authentication bypass incidents
2. **User Experience:** 95% successful registration completion rate
3. **Performance:** Authentication token verification under 100ms
4. **Data Integrity:** 100% user data synchronization between Firebase and backend
5. **Compliance:** Full audit trail for all user account changes
6. **Adoption:** 80% profile completion rate within 24 hours of registration

## Implementation Priority

### Phase 1 (High Priority)
- Firebase token verification and user synchronization
- Basic user registration for Customers and Creators
- Role-based authorization guards
- Profile management endpoints

### Phase 2 (Medium Priority)
- Admin user management capabilities
- Profile picture upload functionality
- Account suspension and soft delete
- MFA integration

### Phase 3 (Low Priority)
- Advanced profile validation
- Audit logging enhancements
- Performance optimizations

## Open Questions

1. **Profile Picture Requirements:** What are the size limits and acceptable formats for profile pictures? 5-10mb
2. **Business Verification:** Do Creator accounts need business verification documents? No
3. **Factory Onboarding:** What specific information do Factories need to provide during account creation? I am not sure yet, maybe location 
4. **Localization:** Should user profiles support multiple languages for names and descriptions? yes
5. **Data Retention:** What is the retention policy for soft-deleted user accounts? use middle east policy specification
6. **API Rate Limiting:** What are the appropriate rate limits for different user roles? make it big for now ...

## API Endpoints Overview

### Authentication Endpoints
- `POST /auth/verify` - Verify Firebase token and sync user data
- `GET /auth/me` - Get current user profile

### User Management Endpoints (Admin Only)
- `POST /admin/users/factory` - Create factory account
- `POST /admin/users/admin` - Create admin account
- `PUT /admin/users/:id/status` - Suspend/activate user account
- `DELETE /admin/users/:id` - Soft delete user account

### Profile Management Endpoints
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `POST /users/profile/picture` - Upload profile picture
- `DELETE /users/profile/picture` - Remove profile picture

### Registration Endpoints
- `POST /auth/register/customer` - Complete customer registration
- `POST /auth/register/creator` - Complete creator registration
