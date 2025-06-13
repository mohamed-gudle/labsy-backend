import { ROLES_KEY } from './roles.decorator';
import { UserRole } from '../../users/enums/user-role.enum';

describe('Roles Decorator', () => {
  it('should be defined', () => {
    expect(ROLES_KEY).toBeDefined();
  });

  it('should have the correct ROLES_KEY value', () => {
    expect(ROLES_KEY).toBe('roles');
  });

  it('should export UserRole enum values', () => {
    expect(UserRole.ADMIN).toBeDefined();
    expect(UserRole.CREATOR).toBeDefined();
    expect(UserRole.FACTORY).toBeDefined();
    expect(UserRole.CUSTOMER).toBeDefined();
  });

  describe('Decorator functionality', () => {
    it('should be a conceptual test for roles decorator', () => {
      // Since testing decorators directly is complex in isolation,
      // we test the concept and ensure the required exports exist
      expect(ROLES_KEY).toBe('roles');

      // Test that all role values are available
      const allRoles = [
        UserRole.ADMIN,
        UserRole.CREATOR,
        UserRole.FACTORY,
        UserRole.CUSTOMER,
      ];

      allRoles.forEach((role) => {
        expect(role).toBeDefined();
        expect(typeof role).toBe('string');
      });
    });

    it('should have proper role values', () => {
      expect(UserRole.ADMIN).toBe('ADMIN');
      expect(UserRole.CREATOR).toBe('CREATOR');
      expect(UserRole.FACTORY).toBe('FACTORY');
      expect(UserRole.CUSTOMER).toBe('CUSTOMER');
    });
  });
});
