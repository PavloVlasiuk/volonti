import { MigrationInterface, QueryRunner } from 'typeorm';

export class RichApplications1779743393818 implements MigrationInterface {
  name = 'RichApplications1779743393818';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications"
        ADD COLUMN "motivation" text NOT NULL DEFAULT '',
        ADD COLUMN "availability" text[] NOT NULL DEFAULT '{}',
        ADD COLUMN "contact_phone" character varying(32),
        ADD COLUMN "experience" text,
        ADD COLUMN "has_transport" boolean NOT NULL DEFAULT false,
        ADD COLUMN "can_start_immediately" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "initiatives" ADD COLUMN "slots_needed" smallint`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "initiatives" DROP COLUMN "slots_needed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications"
        DROP COLUMN "can_start_immediately",
        DROP COLUMN "has_transport",
        DROP COLUMN "experience",
        DROP COLUMN "contact_phone",
        DROP COLUMN "availability",
        DROP COLUMN "motivation"`,
    );
  }
}
