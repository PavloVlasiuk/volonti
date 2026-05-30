import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingRelations1780098519860 implements MigrationInterface {
  name = 'AddMissingRelations1780098519860';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_cc0879b329a312f4877efc07059" FOREIGN KEY ("initiative_id") REFERENCES "initiatives"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "initiative_dismissals" ADD CONSTRAINT "FK_6a19efe17c4c67c19f7320ebb9a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "initiative_dismissals" ADD CONSTRAINT "FK_0a05ada9b51bf335f248ffd9490" FOREIGN KEY ("initiative_id") REFERENCES "initiatives"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "initiative_dismissals" DROP CONSTRAINT "FK_0a05ada9b51bf335f248ffd9490"`,
    );
    await queryRunner.query(
      `ALTER TABLE "initiative_dismissals" DROP CONSTRAINT "FK_6a19efe17c4c67c19f7320ebb9a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_cc0879b329a312f4877efc07059"`,
    );
  }
}
