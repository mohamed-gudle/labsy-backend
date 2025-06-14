import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCatalogSchema1749916746919 implements MigrationInterface {
  name = 'CreateCatalogSchema1749916746919';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "printable_areas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100), "x" numeric(8,2) NOT NULL, "y" numeric(8,2) NOT NULL, "width" numeric(8,2) NOT NULL, "height" numeric(8,2) NOT NULL, "mockup_url" character varying NOT NULL, "dpi" integer DEFAULT '300', "base_product_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "CHK_db150e08f93a91a53dc1c6a19c" CHECK (dpi > 0), CONSTRAINT "CHK_7c8cfcbf9747841da3d44c9123" CHECK (height > 0), CONSTRAINT "CHK_391fc0d54d3c54ff7793ee4b32" CHECK (width > 0), CONSTRAINT "CHK_2730e5dff2892e171f61e58952" CHECK (y >= 0), CONSTRAINT "CHK_b310821678fdb84c0aa584af78" CHECK (x >= 0), CONSTRAINT "PK_f95dca30ca43187f9e9cf9727f2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "base_products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text, "brand" character varying(100) NOT NULL, "type" character varying(100), "category" character varying(100), "material" character varying(255), "base_cost" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'USD', "country" character varying(100), "main_image" character varying, "colors" json NOT NULL, "available_sizes" json NOT NULL, "tags" json, "metadata" json, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_b62650dc3434ddca9345c1503bc" UNIQUE ("title", "brand"), CONSTRAINT "CHK_c65f5753c22d5e4a02ba62ada1" CHECK (LENGTH(title) > 0), CONSTRAINT "CHK_2d099d23f35454e375bf1373ff" CHECK (base_cost > 0), CONSTRAINT "PK_f2067fd7963d18a2f99599fca3c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a95401cae14142ff60e28ceb01" ON "base_products" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_44b241feee7c9d8d131f926ab4" ON "base_products" ("country") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8fa4e3461041d6d2c5a7749482" ON "base_products" ("base_cost") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0743242d5d2b3a33e13c48409f" ON "base_products" ("brand") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_667f3487306830638743656672" ON "base_products" ("category") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6af9dbf18c1b589efc34b4cde6" ON "base_products" ("title") `,
    );
    await queryRunner.query(
      `ALTER TABLE "printable_areas" ADD CONSTRAINT "FK_c426cb582c0f05df556f56c73da" FOREIGN KEY ("base_product_id") REFERENCES "base_products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "printable_areas" DROP CONSTRAINT "FK_c426cb582c0f05df556f56c73da"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6af9dbf18c1b589efc34b4cde6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_667f3487306830638743656672"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0743242d5d2b3a33e13c48409f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8fa4e3461041d6d2c5a7749482"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_44b241feee7c9d8d131f926ab4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a95401cae14142ff60e28ceb01"`,
    );
    await queryRunner.query(`DROP TABLE "base_products"`);
    await queryRunner.query(`DROP TABLE "printable_areas"`);
  }
}
