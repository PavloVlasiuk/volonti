import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserEmailVerified1780073206871 implements MigrationInterface {
  name = 'UserEmailVerified1780073206871';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "email_verified" boolean NOT NULL DEFAULT false`,
    );

    await queryRunner.query(`UPDATE "users" SET "email_verified" = true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email_verified"`);
  }
}
