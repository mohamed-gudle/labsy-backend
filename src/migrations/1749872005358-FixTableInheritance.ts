import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTableInheritance1749872005358 implements MigrationInterface {
    name = 'FixTableInheritance1749872005358'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'customer'`);
    }

}
