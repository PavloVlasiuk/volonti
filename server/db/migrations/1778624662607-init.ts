import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1778624662607 implements MigrationInterface {
  name = 'Init1778624662607';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('VOLUNTEER', 'ADMIN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL, "two_fa_enabled" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "name" character varying(100) NOT NULL, CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "volunteer_interests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "volunteer_profile_id" uuid NOT NULL, "category_id" uuid NOT NULL, CONSTRAINT "UQ_bea3e1319e23becd1c225b9b6a9" UNIQUE ("volunteer_profile_id", "category_id"), CONSTRAINT "PK_56fdd265fa1abb3a20efe06d055" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organizations_type_enum" AS ENUM('NGO', 'CHARITY', 'MUNICIPAL', 'CRISIS_CENTER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organizations_status_enum" AS ENUM('PENDING', 'VERIFIED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "organizations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "name" character varying(255) NOT NULL, "type" "public"."organizations_type_enum" NOT NULL, "edrpou" character varying(8) NOT NULL, "contact_person" character varying(200) NOT NULL, "document_url" character varying(500), "email" character varying(255) NOT NULL, "password_hash" character varying NOT NULL, "status" "public"."organizations_status_enum" NOT NULL DEFAULT 'PENDING', "rejection_reason" text, "verified_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_03611478608496bb910b372a780" UNIQUE ("edrpou"), CONSTRAINT "UQ_4ad920935f4d4eb73fc58b40f72" UNIQUE ("email"), CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."initiatives_type_enum" AS ENUM('URGENT', 'PLANNED', 'ONGOING')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."initiatives_format_enum" AS ENUM('REMOTE', 'ON_SITE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."initiatives_status_enum" AS ENUM('ACTIVE', 'CLOSED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "initiatives" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "title" character varying(255) NOT NULL, "description" text NOT NULL, "type" "public"."initiatives_type_enum" NOT NULL, "format" "public"."initiatives_format_enum" NOT NULL, "city" character varying(100), "min_age" smallint, "requirements" text, "starts_at" date, "ends_at" date, "status" "public"."initiatives_status_enum" NOT NULL DEFAULT 'ACTIVE', "organization_id" uuid NOT NULL, "category_id" uuid NOT NULL, CONSTRAINT "PK_6f2f191bc885b9c50400a8b10d8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."applications_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "applications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "status" "public"."applications_status_enum" NOT NULL DEFAULT 'PENDING', "initiative_id" uuid NOT NULL, "volunteer_profile_id" uuid NOT NULL, CONSTRAINT "UQ_00bb5192644b5fa54eb70f51ac2" UNIQUE ("initiative_id", "volunteer_profile_id"), CONSTRAINT "PK_938c0a27255637bde919591888f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."volunteer_profiles_format_preference_enum" AS ENUM('REMOTE', 'ON_SITE', 'ANY')`,
    );
    await queryRunner.query(
      `CREATE TABLE "volunteer_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "city" character varying(100), "age" smallint, "format_preference" "public"."volunteer_profiles_format_preference_enum" NOT NULL DEFAULT 'ANY', "bio" text, "user_id" uuid NOT NULL, CONSTRAINT "UQ_6b24be7781c877010169534aa31" UNIQUE ("user_id"), CONSTRAINT "REL_6b24be7781c877010169534aa3" UNIQUE ("user_id"), CONSTRAINT "PK_01b274d2ec8a3a044a54819ef6f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."otp_codes_actor_type_enum" AS ENUM('USER', 'ORGANIZATION')`,
    );
    await queryRunner.query(
      `CREATE TABLE "otp_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "code" character varying(255) NOT NULL, "pending_token" character varying NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP WITH TIME ZONE, "actor_id" character varying NOT NULL, "actor_type" "public"."otp_codes_actor_type_enum" NOT NULL, CONSTRAINT "UQ_ef2d9244e328479db36c1ff2217" UNIQUE ("pending_token"), CONSTRAINT "PK_9d0487965ac1837d57fec4d6a26" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_interests" ADD CONSTRAINT "FK_1745afb40a4294be2cd96d34087" FOREIGN KEY ("volunteer_profile_id") REFERENCES "volunteer_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_interests" ADD CONSTRAINT "FK_6e79eb3ebf7183600afb2f36ee9" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "initiatives" ADD CONSTRAINT "FK_e399558976fbd031fa3c9e4323c" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "initiatives" ADD CONSTRAINT "FK_dde85ac4e593c8acc8559ccc9de" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "FK_e528ed13e28bca0aacd52027357" FOREIGN KEY ("initiative_id") REFERENCES "initiatives"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "FK_23371b193a580705604c4f586c2" FOREIGN KEY ("volunteer_profile_id") REFERENCES "volunteer_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profiles" ADD CONSTRAINT "FK_6b24be7781c877010169534aa31" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "volunteer_profiles" DROP CONSTRAINT "FK_6b24be7781c877010169534aa31"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT "FK_23371b193a580705604c4f586c2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT "FK_e528ed13e28bca0aacd52027357"`,
    );
    await queryRunner.query(
      `ALTER TABLE "initiatives" DROP CONSTRAINT "FK_dde85ac4e593c8acc8559ccc9de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "initiatives" DROP CONSTRAINT "FK_e399558976fbd031fa3c9e4323c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_interests" DROP CONSTRAINT "FK_6e79eb3ebf7183600afb2f36ee9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_interests" DROP CONSTRAINT "FK_1745afb40a4294be2cd96d34087"`,
    );
    await queryRunner.query(`DROP TABLE "otp_codes"`);
    await queryRunner.query(`DROP TYPE "public"."otp_codes_actor_type_enum"`);
    await queryRunner.query(`DROP TABLE "volunteer_profiles"`);
    await queryRunner.query(
      `DROP TYPE "public"."volunteer_profiles_format_preference_enum"`,
    );
    await queryRunner.query(`DROP TABLE "applications"`);
    await queryRunner.query(`DROP TYPE "public"."applications_status_enum"`);
    await queryRunner.query(`DROP TABLE "initiatives"`);
    await queryRunner.query(`DROP TYPE "public"."initiatives_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."initiatives_format_enum"`);
    await queryRunner.query(`DROP TYPE "public"."initiatives_type_enum"`);
    await queryRunner.query(`DROP TABLE "organizations"`);
    await queryRunner.query(`DROP TYPE "public"."organizations_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."organizations_type_enum"`);
    await queryRunner.query(`DROP TABLE "volunteer_interests"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
