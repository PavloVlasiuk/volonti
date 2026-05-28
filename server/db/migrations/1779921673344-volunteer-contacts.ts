import { MigrationInterface, QueryRunner } from 'typeorm';

export class VolunteerContacts1779921673344 implements MigrationInterface {
  name = 'VolunteerContacts1779921673344';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "volunteer_profiles" ADD "phone" character varying(32)`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profiles" ADD "telegram" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profiles" ADD "messenger" character varying(200)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "volunteer_profiles" DROP COLUMN "messenger"`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profiles" DROP COLUMN "telegram"`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profiles" DROP COLUMN "phone"`,
    );
  }
}
