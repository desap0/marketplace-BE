import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1736418428542 implements MigrationInterface {
    name = 'Init1736418428542'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'MODERATOR', 'PERFORMER', 'CLIENT', 'BANNED')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "telegram_id" character varying(256) NOT NULL, "telegram_login" character varying(256) NOT NULL, "name" character varying(256) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'CLIENT', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "type" character varying NOT NULL, CONSTRAINT "UQ_1a1e4649fd31ea6ec6b025c7bfc" UNIQUE ("telegram_id"), CONSTRAINT "UQ_57a555854e0c819ad63c380a82b" UNIQUE ("telegram_login"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_94e2000b5f7ee1f9c491f0f8a8" ON "users" ("type") `);
        await queryRunner.query(`CREATE TYPE "public"."tasks_status_enum" AS ENUM('DONE', 'PROBLEM', 'CANCELED', 'PROGRESS', 'NOT STARTED')`);
        await queryRunner.query(`CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(256) NOT NULL, "description" character varying(5000), "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'NOT STARTED', "price" integer NOT NULL, "is_client_approved" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "client_id" uuid, "performer_id" uuid, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "supports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message" character varying(5000) NOT NULL, "is_ended" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "answer" character varying(5000), "type" character varying NOT NULL, "user_id" uuid, "moderator_id" uuid, CONSTRAINT "PK_d8c2a7cbebc6494f00dda770105" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9c253108f5db030f0e8c396026" ON "supports" ("type") `);
        await queryRunner.query(`CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message" character varying(128), "stars" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_from_id" uuid, "user_to_id" uuid, "task_id" uuid, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payments_type_enum" AS ENUM('IN', 'OUT')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "requisites" character varying(16) NOT NULL, "amount" integer NOT NULL, "type" "public"."payments_type_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_type_enum" AS ENUM('ADD', 'SUB')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" integer NOT NULL, "type" "public"."transactions_type_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "payment_id" uuid, "task_id" uuid, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_928436d97a43697186374c4ef77" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_4d39dd03742b19b55ed0544b5c3" FOREIGN KEY ("performer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "supports" ADD CONSTRAINT "FK_ba8fa43046519c0520db7e70f45" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "supports" ADD CONSTRAINT "FK_bb72482398bff36e67850af2b1e" FOREIGN KEY ("moderator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_3cff33afdb2af61e63739120f00" FOREIGN KEY ("user_from_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_4b4ce5e68163f33d9733ff26fa9" FOREIGN KEY ("user_to_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_510ad253ff1b78940cd5565a56e" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_427785468fb7d2733f59e7d7d39" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_464da95dc8a05470b2b158d4df6" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_8ba1e2bd056b17468f5d8fe9f8f" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_8ba1e2bd056b17468f5d8fe9f8f"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_464da95dc8a05470b2b158d4df6"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_427785468fb7d2733f59e7d7d39"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_510ad253ff1b78940cd5565a56e"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_4b4ce5e68163f33d9733ff26fa9"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_3cff33afdb2af61e63739120f00"`);
        await queryRunner.query(`ALTER TABLE "supports" DROP CONSTRAINT "FK_bb72482398bff36e67850af2b1e"`);
        await queryRunner.query(`ALTER TABLE "supports" DROP CONSTRAINT "FK_ba8fa43046519c0520db7e70f45"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_4d39dd03742b19b55ed0544b5c3"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_928436d97a43697186374c4ef77"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_type_enum"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9c253108f5db030f0e8c396026"`);
        await queryRunner.query(`DROP TABLE "supports"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_94e2000b5f7ee1f9c491f0f8a8"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
