import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUserInheritance1718362041000 implements MigrationInterface {
  name = 'FixUserInheritance1718362041000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, update the user table to ensure all user data is there
    // Move data from role tables to users table if missing
    await queryRunner.query(`
      -- Copy data from customers to users where it doesn't exist
      INSERT INTO users (id, firebase_uid, email, name, role, status, profile_picture_url, 
                        email_verified, last_login_at, created_at, updated_at, deleted_at)
      SELECT c.id, c.firebase_uid, c.email, c.name, 'customer'::users_role_enum, 'active'::users_status_enum, c.profile_picture_url,
             c.email_verified, c.last_login_at, c.created_at, c.updated_at, c.deleted_at
      FROM customers c
      LEFT JOIN users u ON c.id = u.id
      WHERE u.id IS NULL
      ON CONFLICT DO NOTHING;
      
      -- Copy data from creators to users where it doesn't exist
      INSERT INTO users (id, firebase_uid, email, name, role, status, profile_picture_url, 
                        email_verified, last_login_at, created_at, updated_at, deleted_at)
      SELECT c.id, c.firebase_uid, c.email, c.name, 'creator'::users_role_enum, 'active'::users_status_enum, c.profile_picture_url,
             c.email_verified, c.last_login_at, c.created_at, c.updated_at, c.deleted_at
      FROM creators c
      LEFT JOIN users u ON c.id = u.id
      WHERE u.id IS NULL
      ON CONFLICT DO NOTHING;
      
      -- Copy data from factories to users where it doesn't exist
      INSERT INTO users (id, firebase_uid, email, name, role, status, profile_picture_url, 
                        email_verified, last_login_at, created_at, updated_at, deleted_at)
      SELECT f.id, f.firebase_uid, f.email, f.name, 'factory'::users_role_enum, 'active'::users_status_enum, f.profile_picture_url,
             f.email_verified, f.last_login_at, f.created_at, f.updated_at, f.deleted_at
      FROM factories f
      LEFT JOIN users u ON f.id = u.id
      WHERE u.id IS NULL
      ON CONFLICT DO NOTHING;
      
      -- Copy data from admins to users where it doesn't exist
      INSERT INTO users (id, firebase_uid, email, name, role, status, profile_picture_url, 
                        email_verified, last_login_at, created_at, updated_at, deleted_at)
      SELECT a.id, a.firebase_uid, a.email, a.name, 'admin'::users_role_enum, 'active'::users_status_enum, a.profile_picture_url,
             a.email_verified, a.last_login_at, a.created_at, a.updated_at, a.deleted_at
      FROM admins a
      LEFT JOIN users u ON a.id = u.id
      WHERE u.id IS NULL
      ON CONFLICT DO NOTHING;
    `);

    // Now remove columns from role tables that are already in the users table
    await queryRunner.query(`
      -- Drop existing duplicate columns from customers table
      ALTER TABLE customers 
        DROP COLUMN IF EXISTS firebase_uid,
        DROP COLUMN IF EXISTS email,
        DROP COLUMN IF EXISTS name,
        DROP COLUMN IF EXISTS role,
        DROP COLUMN IF EXISTS status,
        DROP COLUMN IF EXISTS profile_picture_url,
        DROP COLUMN IF EXISTS email_verified,
        DROP COLUMN IF EXISTS last_login_at,
        DROP COLUMN IF EXISTS created_at,
        DROP COLUMN IF EXISTS updated_at,
        DROP COLUMN IF EXISTS deleted_at;
        
      -- Drop existing duplicate columns from creators table
      ALTER TABLE creators 
        DROP COLUMN IF EXISTS firebase_uid,
        DROP COLUMN IF EXISTS email,
        DROP COLUMN IF EXISTS name,
        DROP COLUMN IF EXISTS role,
        DROP COLUMN IF EXISTS status,
        DROP COLUMN IF EXISTS profile_picture_url,
        DROP COLUMN IF EXISTS email_verified,
        DROP COLUMN IF EXISTS last_login_at,
        DROP COLUMN IF EXISTS created_at,
        DROP COLUMN IF EXISTS updated_at,
        DROP COLUMN IF EXISTS deleted_at;
        
      -- Drop existing duplicate columns from factories table
      ALTER TABLE factories 
        DROP COLUMN IF EXISTS firebase_uid,
        DROP COLUMN IF EXISTS email,
        DROP COLUMN IF EXISTS name,
        DROP COLUMN IF EXISTS role,
        DROP COLUMN IF EXISTS status,
        DROP COLUMN IF EXISTS profile_picture_url,
        DROP COLUMN IF EXISTS email_verified,
        DROP COLUMN IF EXISTS last_login_at,
        DROP COLUMN IF EXISTS created_at,
        DROP COLUMN IF EXISTS updated_at,
        DROP COLUMN IF EXISTS deleted_at;
        
      -- Drop existing duplicate columns from admins table
      ALTER TABLE admins 
        DROP COLUMN IF EXISTS firebase_uid,
        DROP COLUMN IF EXISTS email,
        DROP COLUMN IF EXISTS name,
        DROP COLUMN IF EXISTS role,
        DROP COLUMN IF EXISTS status,
        DROP COLUMN IF EXISTS profile_picture_url,
        DROP COLUMN IF EXISTS email_verified,
        DROP COLUMN IF EXISTS last_login_at,
        DROP COLUMN IF EXISTS created_at,
        DROP COLUMN IF EXISTS updated_at,
        DROP COLUMN IF EXISTS deleted_at;
    `);

    // Set up proper foreign key relationships
    await queryRunner.query(`
      -- Add foreign key to customers table
      ALTER TABLE customers
        ADD CONSTRAINT fk_customer_user
        FOREIGN KEY (id)
        REFERENCES users (id)
        ON DELETE CASCADE;
        
      -- Add foreign key to creators table
      ALTER TABLE creators
        ADD CONSTRAINT fk_creator_user
        FOREIGN KEY (id)
        REFERENCES users (id)
        ON DELETE CASCADE;
        
      -- Add foreign key to factories table
      ALTER TABLE factories
        ADD CONSTRAINT fk_factory_user
        FOREIGN KEY (id)
        REFERENCES users (id)
        ON DELETE CASCADE;
        
      -- Add foreign key to admins table
      ALTER TABLE admins
        ADD CONSTRAINT fk_admin_user
        FOREIGN KEY (id)
        REFERENCES users (id)
        ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the foreign key constraints
    await queryRunner.query(`
      ALTER TABLE customers DROP CONSTRAINT IF EXISTS fk_customer_user;
      ALTER TABLE creators DROP CONSTRAINT IF EXISTS fk_creator_user;
      ALTER TABLE factories DROP CONSTRAINT IF EXISTS fk_factory_user;
      ALTER TABLE admins DROP CONSTRAINT IF EXISTS fk_admin_user;
    `);

    // Note: Restoring the previous state completely would be complex
    // as it would involve copying data back from users table to the child tables.
    // This is a simplified down migration.
  }
}
