import { MigrationInterface, QueryRunner } from 'typeorm';

export class ParticipationLifecycle1779744504138 implements MigrationInterface {
  name = 'ParticipationLifecycle1779744504138';

  public transaction = false as const;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."initiatives_status_enum" ADD VALUE IF NOT EXISTS 'COMPLETED'`,
    );
    await queryRunner.query(
      `ALTER TABLE "initiatives" ADD COLUMN "completed_at" TIMESTAMPTZ NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications"
        ADD COLUMN "participated" boolean NULL,
        ADD COLUMN "hours_logged" numeric(5,1) NULL,
        ADD COLUMN "completed_at" TIMESTAMPTZ NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications"
        DROP COLUMN "completed_at",
        DROP COLUMN "hours_logged",
        DROP COLUMN "participated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "initiatives" DROP COLUMN "completed_at"`,
    );
    // NOTE: Postgres cannot drop a value from an enum type cleanly without
    // recreating the type; the 'COMPLETED' label remains in
    // "initiatives_status_enum" after rollback. Live data should not reference it.
  }
}
