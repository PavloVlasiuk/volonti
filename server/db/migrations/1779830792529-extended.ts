import { MigrationInterface, QueryRunner } from 'typeorm';

export class Test1779830792529 implements MigrationInterface {
  name = 'Test1779830792529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."review_party_enum" AS ENUM('VOLUNTEER', 'ORGANIZATION')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "initiative_id" uuid NOT NULL, "author_type" "public"."review_party_enum" NOT NULL, "author_id" uuid NOT NULL, "target_type" "public"."review_party_enum" NOT NULL, "target_id" uuid NOT NULL, "rating" smallint NOT NULL, "comment" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_2ea381a5c2f8bef0073a48f6bd" CHECK ("rating" BETWEEN 1 AND 5), CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reviews_target" ON "reviews" ("target_type", "target_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_reviews_initiative_author_target" ON "reviews" ("initiative_id", "author_type", "author_id", "target_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "initiative_dismissals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "initiative_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0edb52b728e8b72cc888218d9de" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_initiative_dismissals_user_initiative" ON "initiative_dismissals" ("user_id", "initiative_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "initiatives" ADD "slots_needed" smallint`,
    );
    await queryRunner.query(
      `ALTER TABLE "initiatives" ADD "completed_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "motivation" text NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "availability" text array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "contact_phone" character varying(32)`,
    );
    await queryRunner.query(`ALTER TABLE "applications" ADD "experience" text`);
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "has_transport" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "can_start_immediately" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "participated" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "hours_logged" numeric(5,1)`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "completed_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."initiatives_status_enum" RENAME TO "initiatives_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."initiatives_status_enum" AS ENUM('ACTIVE', 'CLOSED', 'COMPLETED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "initiatives" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "initiatives" ALTER COLUMN "status" TYPE "public"."initiatives_status_enum" USING "status"::"text"::"public"."initiatives_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "initiatives" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'`,
    );
    await queryRunner.query(`DROP TYPE "public"."initiatives_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."initiatives_status_enum_old" AS ENUM('ACTIVE', 'CLOSED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "initiatives" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "initiatives" ALTER COLUMN "status" TYPE "public"."initiatives_status_enum_old" USING "status"::"text"::"public"."initiatives_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "initiatives" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'`,
    );
    await queryRunner.query(`DROP TYPE "public"."initiatives_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."initiatives_status_enum_old" RENAME TO "initiatives_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "completed_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "hours_logged"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "participated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "can_start_immediately"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "has_transport"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "experience"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "contact_phone"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "availability"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "motivation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "initiatives" DROP COLUMN "completed_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "initiatives" DROP COLUMN "slots_needed"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."UQ_initiative_dismissals_user_initiative"`,
    );
    await queryRunner.query(`DROP TABLE "initiative_dismissals"`);
    await queryRunner.query(
      `DROP INDEX "public"."UQ_reviews_initiative_author_target"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_reviews_target"`);
    await queryRunner.query(`DROP TABLE "reviews"`);
    await queryRunner.query(`DROP TYPE "public"."review_party_enum"`);
  }
}
