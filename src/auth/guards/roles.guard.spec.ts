import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    const mockUser: Partial<User> = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        firebaseUid: 'firebase-uid-123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.CUSTOMER,
    };

    const mockReflector = {
        getAllAndOverride: jest.fn(),
    };

    const createMockExecutionContext = (request: any): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => request,
                getResponse: jest.fn(),
                getNext: jest.fn(),
            }),
            getClass: jest.fn(),
            getHandler: jest.fn(),
            getArgs: jest.fn(),
            getArgByIndex: jest.fn(),
            switchToRpc: jest.fn(),
            switchToWs: jest.fn(),
            getType: jest.fn(),
        } as ExecutionContext;
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesGuard,
                {
                    provide: Reflector,
                    useValue: mockReflector,
                },
            ],
        }).compile();

        guard = module.get<RolesGuard>(RolesGuard);
        reflector = module.get<Reflector>(Reflector);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        it('should return true when no roles are required', () => {
            const mockRequest = { user: mockUser };
            const context = createMockExecutionContext(mockRequest);

            mockReflector.getAllAndOverride.mockReturnValue(undefined);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
        });

        it('should return true when empty roles array is provided', () => {
            const mockRequest = { user: mockUser };
            const context = createMockExecutionContext(mockRequest);

            mockReflector.getAllAndOverride.mockReturnValue([]);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
        });

        it('should return true when user has the required role', () => {
            const mockRequest = { user: mockUser };
            const context = createMockExecutionContext(mockRequest);

            mockReflector.getAllAndOverride.mockReturnValue([UserRole.CUSTOMER]);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
        });

        it('should return true when user has one of multiple required roles', () => {
            const mockRequest = { user: mockUser };
            const context = createMockExecutionContext(mockRequest);

            mockReflector.getAllAndOverride.mockReturnValue([
                UserRole.ADMIN,
                UserRole.CUSTOMER,
                UserRole.CREATOR,
            ]);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
        });

        it('should throw ForbiddenException when user is not found in request', () => {
            const mockRequest = {}; // No user attached
            const context = createMockExecutionContext(mockRequest);

            mockReflector.getAllAndOverride.mockReturnValue([UserRole.CUSTOMER]);

            expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
            expect(() => guard.canActivate(context)).toThrow(
                'User not found. Make sure FirebaseAuthGuard is applied first.',
            );

            expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
        });

        it('should throw ForbiddenException when user does not have required role', () => {
            const mockRequest = { user: mockUser };
            const context = createMockExecutionContext(mockRequest);

            mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

            expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
            expect(() => guard.canActivate(context)).toThrow(
                `Access denied. Required roles: ${UserRole.ADMIN}. User role: ${UserRole.CUSTOMER}`,
            );

            expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
        });

        it('should throw ForbiddenException when user does not have any of multiple required roles', () => {
            const mockRequest = { user: mockUser };
            const context = createMockExecutionContext(mockRequest);

            const requiredRoles = [UserRole.ADMIN, UserRole.FACTORY];
            mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

            expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
            expect(() => guard.canActivate(context)).toThrow(
                `Access denied. Required roles: ${requiredRoles.join(', ')}. User role: ${UserRole.CUSTOMER}`,
            );

            expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
        });

        it('should work correctly with different user roles', () => {
            const testCases = [
                {
                    userRole: UserRole.ADMIN,
                    requiredRoles: [UserRole.ADMIN],
                    shouldPass: true,
                },
                {
                    userRole: UserRole.CREATOR,
                    requiredRoles: [UserRole.CREATOR, UserRole.CUSTOMER],
                    shouldPass: true,
                },
                {
                    userRole: UserRole.FACTORY,
                    requiredRoles: [UserRole.ADMIN],
                    shouldPass: false,
                },
                {
                    userRole: UserRole.CUSTOMER,
                    requiredRoles: [UserRole.ADMIN, UserRole.FACTORY],
                    shouldPass: false,
                },
            ];

            testCases.forEach(({ userRole, requiredRoles, shouldPass }, index) => {
                const userWithRole = { ...mockUser, role: userRole };
                const mockRequest = { user: userWithRole };
                const context = createMockExecutionContext(mockRequest);

                mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);

                if (shouldPass) {
                    const result = guard.canActivate(context);
                    expect(result).toBe(true);
                } else {
                    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
                }

                // Clear mocks for next iteration
                jest.clearAllMocks();
            });
        });

        it('should handle null user correctly', () => {
            const mockRequest = { user: null };
            const context = createMockExecutionContext(mockRequest);

            mockReflector.getAllAndOverride.mockReturnValue([UserRole.CUSTOMER]);

            expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
            expect(() => guard.canActivate(context)).toThrow(
                'User not found. Make sure FirebaseAuthGuard is applied first.',
            );
        });

        it('should handle undefined user correctly', () => {
            const mockRequest = { user: undefined };
            const context = createMockExecutionContext(mockRequest);

            mockReflector.getAllAndOverride.mockReturnValue([UserRole.CUSTOMER]);

            expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
            expect(() => guard.canActivate(context)).toThrow(
                'User not found. Make sure FirebaseAuthGuard is applied first.',
            );
        });

        it('should call reflector with correct parameters', () => {
            const mockRequest = { user: mockUser };
            const context = createMockExecutionContext(mockRequest);

            mockReflector.getAllAndOverride.mockReturnValue([UserRole.CUSTOMER]);

            guard.canActivate(context);

            expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(1);
        });
    });
});
