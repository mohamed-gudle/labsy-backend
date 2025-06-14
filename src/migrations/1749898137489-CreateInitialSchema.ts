import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1749898137489 implements MigrationInterface {
  name = 'CreateInitialSchema1749898137489';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firebase_uid" character varying NOT NULL, "email" character varying NOT NULL, "name" character varying, "role" "public"."users_role_enum" NOT NULL, "status" "public"."users_status_enum" NOT NULL DEFAULT 'active', "profile_picture_url" character varying, "email_verified" boolean NOT NULL DEFAULT false, "last_login_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "employee_id" character varying, "department" character varying, "position" character varying, "phone" character varying, "permissions" text DEFAULT '', "admin_level" "public"."users_admin_level_enum" DEFAULT 'support', "two_factor_enabled" boolean DEFAULT false, "two_factor_secret" character varying, "admin_settings" jsonb DEFAULT '{}', "last_active_at" TIMESTAMP, "allowed_ips" text, "session_timeout" integer DEFAULT '3600', "business_name" character varying, "business_description" text, "business_license" character varying, "tax_id" character varying, "social_media_links" jsonb, "business_address" jsonb, "categories" text, "bank_account_info" jsonb, "profile_completion_percentage" integer DEFAULT '0', "store_settings" jsonb DEFAULT '{}', "verification_status" "public"."users_verification_status_enum" DEFAULT 'pending', "verified_at" TIMESTAMP, "preferred_language" character varying DEFAULT 'ar', "date_of_birth" date, "gender" character varying, "shipping_addresses" jsonb, "marketing_preferences" jsonb DEFAULT '{}', "company_name" character varying, "company_description" text, "contact_person" character varying, "location" jsonb, "capabilities" jsonb, "operational_details" jsonb DEFAULT '{}', "certifications" text, "minimum_order_quantities" jsonb, "production_capacity" jsonb, "partnership_terms" jsonb, CONSTRAINT "UQ_0fd54ced5cc75f7cb92925dd803" UNIQUE ("firebase_uid"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_9760615d88ed518196bb79ea03d" UNIQUE ("employee_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0fd54ced5cc75f7cb92925dd80" ON "users" ("firebase_uid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ace513fa30d485cfd25c11a9e4" ON "users" ("role") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ace513fa30d485cfd25c11a9e4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0fd54ced5cc75f7cb92925dd80"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
