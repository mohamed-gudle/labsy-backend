/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { AuthService } from '../auth.service';
import { UserRole, UserStatus } from '../../users/enums';
import { User } from '../../users/entities/user.entity';

describe('FirebaseAuthGuard', () => {
    let guard: FirebaseAuthGuard;
    let authService: AuthService;

    const mockUser: User = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        firebaseUid: 'firebase-uid-123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        profilePictureUrl: 'https://example.com/avatar.jpg',
        emailVerified: true,
        lastLoginAt: new Date('2025-06-12T10:30:00Z'),
        createdAt: new Date('2025-06-01T10:30:00Z'),
        updatedAt: new Date('2025-06-12T10:30:00Z'),
        deletedAt: undefined,
    } as User;

    const mockDecodedToken = {
        uid: 'firebase-uid-123',
        email: 'test@example.com',
        email_verified: true,
        name: 'Test User',
        iat: 1623456789,
        exp: 1623460389,
    };

    const mockAuthService = {
        verifyFirebaseToken: jest.fn(),
        findUserByFirebaseUid: jest.fn(),
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
                FirebaseAuthGuard,
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        guard = module.get<FirebaseAuthGuard>(FirebaseAuthGuard);
        authService = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        it('should return true for valid token and active user', async () => {
            const mockRequest = {
                headers: {
                    authorization: 'Bearer valid-token',
                },
            };

            mockAuthService.verifyFirebaseToken.mockResolvedValue(mockDecodedToken);
            mockAuthService.findUserByFirebaseUid.mockResolvedValue(mockUser);

            const context = createMockExecutionContext(mockRequest);
            const result = await guard.canActivate(context);

            expect(result).toBe(true);
            expect(authService.verifyFirebaseToken).toHaveBeenCalledWith(
                'valid-token',
            );
            expect(authService.findUserByFirebaseUid).toHaveBeenCalledWith(
                'firebase-uid-123',
            );
            expect(mockRequest.user).toBe(mockUser);
            expect(mockRequest.decodedToken).toBe(mockDecodedToken);
        });

        it('should throw UnauthorizedException when authorization header is missing', async () => {
            const mockRequest = {
                headers: {},
            };

            const context = createMockExecutionContext(mockRequest);

            await expect(guard.canActivate(context)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(guard.canActivate(context)).rejects.toThrow(
                'Authorization header with Bearer token is required',
            );

            expect(authService.verifyFirebaseToken).not.toHaveBeenCalled();
            expect(authService.findUserByFirebaseUid).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when authorization header does not start with Bearer', async () => {
            const invalidHeaders = [
                'Basic valid-token',
                'Token valid-token',
                'valid-token',
                'Bearer',
                '',
            ];

            for (const authorization of invalidHeaders) {
                const mockRequest = {
                    headers: { authorization },
                };

                const context = createMockExecutionContext(mockRequest);

                await expect(guard.canActivate(context)).rejects.toThrow(
                    UnauthorizedException,
                );
                await expect(guard.canActivate(context)).rejects.toThrow(
                    'Authorization header with Bearer token is required',
                );
            }

            expect(authService.verifyFirebaseToken).not.toHaveBeenCalled();
            expect(authService.findUserByFirebaseUid).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when Firebase token verification fails', async () => {
            const mockRequest = {
                headers: {
                    authorization: 'Bearer invalid-token',
                },
            };

            mockAuthService.verifyFirebaseToken.mockRejectedValue(
                new Error('Invalid token'),
            );

            const context = createMockExecutionContext(mockRequest);

            await expect(guard.canActivate(context)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(guard.canActivate(context)).rejects.toThrow(
                'Invalid or expired token',
            );

            expect(authService.verifyFirebaseToken).toHaveBeenCalledWith(
                'invalid-token',
            );
            expect(authService.findUserByFirebaseUid).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when user is not found in database', async () => {
            const mockRequest = {
                headers: {
                    authorization: 'Bearer valid-token',
                },
            };

            mockAuthService.verifyFirebaseToken.mockResolvedValue(mockDecodedToken);
            mockAuthService.findUserByFirebaseUid.mockResolvedValue(null);

            const context = createMockExecutionContext(mockRequest);

            await expect(guard.canActivate(context)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(guard.canActivate(context)).rejects.toThrow(
                'User not found in database',
            );

            expect(authService.verifyFirebaseToken).toHaveBeenCalledWith(
                'valid-token',
            );
            expect(authService.findUserByFirebaseUid).toHaveBeenCalledWith(
                'firebase-uid-123',
            );
        });

        it('should throw UnauthorizedException when user account is not active', async () => {
            const inactiveUser = { ...mockUser, status: UserStatus.SUSPENDED };
            const mockRequest = {
                headers: {
                    authorization: 'Bearer valid-token',
                },
            };

            mockAuthService.verifyFirebaseToken.mockResolvedValue(mockDecodedToken);
            mockAuthService.findUserByFirebaseUid.mockResolvedValue(inactiveUser);

            const context = createMockExecutionContext(mockRequest);

            await expect(guard.canActivate(context)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(guard.canActivate(context)).rejects.toThrow(
                'User account is not active',
            );

            expect(authService.verifyFirebaseToken).toHaveBeenCalledWith(
                'valid-token',
            );
            expect(authService.findUserByFirebaseUid).toHaveBeenCalledWith(
                'firebase-uid-123',
            );
        });

        it('should handle UnauthorizedException from auth service correctly', async () => {
            const mockRequest = {
                headers: {
                    authorization: 'Bearer expired-token',
                },
            };

            const unauthorizedError = new UnauthorizedException('Token expired');
            mockAuthService.verifyFirebaseToken.mockRejectedValue(unauthorizedError);

            const context = createMockExecutionContext(mockRequest);

            await expect(guard.canActivate(context)).rejects.toThrow(
                unauthorizedError,
            );

            expect(authService.verifyFirebaseToken).toHaveBeenCalledWith(
                'expired-token',
            );
            expect(authService.findUserByFirebaseUid).not.toHaveBeenCalled();
        });

        it('should extract token correctly from authorization header', async () => {
            const testCases = [
                {
                    authorization: 'Bearer token123',
                    expectedToken: 'token123',
                },
                {
                    authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyN...',
                    expectedToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyN...',
                },
                {
                    authorization: 'Bearer token-with-dashes',
                    expectedToken: 'token-with-dashes',
                },
            ];

            mockAuthService.verifyFirebaseToken.mockResolvedValue(mockDecodedToken);
            mockAuthService.findUserByFirebaseUid.mockResolvedValue(mockUser);

            for (const testCase of testCases) {
                const mockRequest = {
                    headers: {
                        authorization: testCase.authorization,
                    },
                };

                const context = createMockExecutionContext(mockRequest);
                await guard.canActivate(context);

                expect(authService.verifyFirebaseToken).toHaveBeenCalledWith(
                    testCase.expectedToken,
                );
            }
        });
    });
});
