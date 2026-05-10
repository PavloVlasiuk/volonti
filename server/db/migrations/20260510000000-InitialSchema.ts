import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema20260510000000 implements MigrationInterface {
  name = 'InitialSchema20260510000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enum types
    await queryRunner.query(
      `CREATE TYPE "user_role" AS ENUM ('VOLUNTEER', 'ORGANIZATION', 'ADMIN')`,
    );
    await queryRunner.query(
      `CREATE TYPE "org_type" AS ENUM ('NGO', 'CHARITY', 'MUNICIPAL', 'CRISIS_CENTER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "org_status" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "format_type" AS ENUM ('REMOTE', 'ON_SITE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "format_preference" AS ENUM ('REMOTE', 'ON_SITE', 'ANY')`,
    );
    await queryRunner.query(
      `CREATE TYPE "initiative_type" AS ENUM ('URGENT', 'PLANNED', 'ONGOING')`,
    );
    await queryRunner.query(
      `CREATE TYPE "initiative_status" AS ENUM ('ACTIVE', 'CLOSED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "application_status" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED')`,
    );

    // users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"              UUID          NOT NULL DEFAULT gen_random_uuid(),
        "email"           VARCHAR(255)  NOT NULL,
        "password_hash"   VARCHAR(255)  NOT NULL,
        "role"            "user_role"   NOT NULL,
        "two_fa_enabled"  BOOLEAN       NOT NULL DEFAULT false,
        "created_at"      TIMESTAMPTZ   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    // otp_codes
    await queryRunner.query(`
      CREATE TABLE "otp_codes" (
        "id"             UUID         NOT NULL DEFAULT gen_random_uuid(),
        "code"           VARCHAR(6)   NOT NULL,
        "pending_token"  UUID         NOT NULL,
        "expires_at"     TIMESTAMPTZ  NOT NULL,
        "used_at"        TIMESTAMPTZ,
        "user_id"        UUID         NOT NULL,
        CONSTRAINT "PK_otp_codes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_otp_codes_pending_token" UNIQUE ("pending_token"),
        CONSTRAINT "FK_otp_codes_user" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    // volunteer_profiles
    await queryRunner.query(`
      CREATE TABLE "volunteer_profiles" (
        "id"                UUID               NOT NULL DEFAULT gen_random_uuid(),
        "first_name"        VARCHAR(100)       NOT NULL,
        "last_name"         VARCHAR(100)       NOT NULL,
        "city"              VARCHAR(100),
        "age"               SMALLINT,
        "format_preference" "format_preference" NOT NULL DEFAULT 'ANY',
        "bio"               TEXT,
        "updated_at"        TIMESTAMPTZ        NOT NULL DEFAULT now(),
        "user_id"           UUID               NOT NULL,
        CONSTRAINT "PK_volunteer_profiles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_volunteer_profiles_user" UNIQUE ("user_id"),
        CONSTRAINT "FK_volunteer_profiles_user" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    // organizations
    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id"               UUID          NOT NULL DEFAULT gen_random_uuid(),
        "name"             VARCHAR(255)  NOT NULL,
        "type"             "org_type"    NOT NULL,
        "edrpou"           CHAR(8)       NOT NULL,
        "contact_person"   VARCHAR(200)  NOT NULL,
        "document_url"     VARCHAR(500),
        "status"           "org_status"  NOT NULL DEFAULT 'PENDING',
        "rejection_reason" TEXT,
        "verified_at"      TIMESTAMPTZ,
        "created_at"       TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "user_id"          UUID          NOT NULL,
        CONSTRAINT "PK_organizations" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_organizations_edrpou" UNIQUE ("edrpou"),
        CONSTRAINT "UQ_organizations_user" UNIQUE ("user_id"),
        CONSTRAINT "FK_organizations_user" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    // categories
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id"    UUID         NOT NULL DEFAULT gen_random_uuid(),
        "name"  VARCHAR(100) NOT NULL,
        CONSTRAINT "PK_categories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categories_name" UNIQUE ("name")
      )
    `);

    // volunteer_interests
    await queryRunner.query(`
      CREATE TABLE "volunteer_interests" (
        "id"                    UUID  NOT NULL DEFAULT gen_random_uuid(),
        "volunteer_profile_id"  UUID  NOT NULL,
        "category_id"           UUID  NOT NULL,
        CONSTRAINT "PK_volunteer_interests" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_volunteer_interests" UNIQUE ("volunteer_profile_id", "category_id"),
        CONSTRAINT "FK_volunteer_interests_profile" FOREIGN KEY ("volunteer_profile_id")
          REFERENCES "volunteer_profiles" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_volunteer_interests_category" FOREIGN KEY ("category_id")
          REFERENCES "categories" ("id") ON DELETE CASCADE
      )
    `);

    // initiatives
    await queryRunner.query(`
      CREATE TABLE "initiatives" (
        "id"               UUID                NOT NULL DEFAULT gen_random_uuid(),
        "title"            VARCHAR(255)        NOT NULL,
        "description"      TEXT                NOT NULL,
        "type"             "initiative_type"   NOT NULL,
        "format"           "format_type"       NOT NULL,
        "city"             VARCHAR(100),
        "min_age"          SMALLINT,
        "requirements"     TEXT,
        "starts_at"        DATE,
        "ends_at"          DATE,
        "status"           "initiative_status" NOT NULL DEFAULT 'ACTIVE',
        "created_at"       TIMESTAMPTZ         NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMPTZ         NOT NULL DEFAULT now(),
        "organization_id"  UUID                NOT NULL,
        "category_id"      UUID                NOT NULL,
        CONSTRAINT "PK_initiatives" PRIMARY KEY ("id"),
        CONSTRAINT "FK_initiatives_organization" FOREIGN KEY ("organization_id")
          REFERENCES "organizations" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_initiatives_category" FOREIGN KEY ("category_id")
          REFERENCES "categories" ("id")
      )
    `);

    // applications
    await queryRunner.query(`
      CREATE TABLE "applications" (
        "id"                    UUID                 NOT NULL DEFAULT gen_random_uuid(),
        "status"                "application_status" NOT NULL DEFAULT 'PENDING',
        "created_at"            TIMESTAMPTZ          NOT NULL DEFAULT now(),
        "updated_at"            TIMESTAMPTZ          NOT NULL DEFAULT now(),
        "initiative_id"         UUID                 NOT NULL,
        "volunteer_profile_id"  UUID                 NOT NULL,
        CONSTRAINT "PK_applications" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_applications" UNIQUE ("initiative_id", "volunteer_profile_id"),
        CONSTRAINT "FK_applications_initiative" FOREIGN KEY ("initiative_id")
          REFERENCES "initiatives" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_applications_volunteer_profile" FOREIGN KEY ("volunteer_profile_id")
          REFERENCES "volunteer_profiles" ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "applications"`);
    await queryRunner.query(`DROP TABLE "initiatives"`);
    await queryRunner.query(`DROP TABLE "volunteer_interests"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "organizations"`);
    await queryRunner.query(`DROP TABLE "volunteer_profiles"`);
    await queryRunner.query(`DROP TABLE "otp_codes"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "application_status"`);
    await queryRunner.query(`DROP TYPE "initiative_status"`);
    await queryRunner.query(`DROP TYPE "initiative_type"`);
    await queryRunner.query(`DROP TYPE "format_preference"`);
    await queryRunner.query(`DROP TYPE "format_type"`);
    await queryRunner.query(`DROP TYPE "org_status"`);
    await queryRunner.query(`DROP TYPE "org_type"`);
    await queryRunner.query(`DROP TYPE "user_role"`);
  }
}
