import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1685423170924 implements MigrationInterface {
    name = 'InitialSchema1685423170924'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL, "admin" boolean NOT NULL DEFAULT (0))`);
        await queryRunner.query(`CREATE TABLE "contact" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "accountNumber" varchar NOT NULL, "bankName" varchar NOT NULL, "contactName" varchar NOT NULL, "userId" integer)`);
        await queryRunner.query(`CREATE TABLE "temporary_contact" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "accountNumber" varchar NOT NULL, "bankName" varchar NOT NULL, "contactName" varchar NOT NULL, "userId" integer, CONSTRAINT "FK_e7e34fa8e409e9146f4729fd0cb" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_contact"("id", "accountNumber", "bankName", "contactName", "userId") SELECT "id", "accountNumber", "bankName", "contactName", "userId" FROM "contact"`);
        await queryRunner.query(`DROP TABLE "contact"`);
        await queryRunner.query(`ALTER TABLE "temporary_contact" RENAME TO "contact"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contact" RENAME TO "temporary_contact"`);
        await queryRunner.query(`CREATE TABLE "contact" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "accountNumber" varchar NOT NULL, "bankName" varchar NOT NULL, "contactName" varchar NOT NULL, "userId" integer)`);
        await queryRunner.query(`INSERT INTO "contact"("id", "accountNumber", "bankName", "contactName", "userId") SELECT "id", "accountNumber", "bankName", "contactName", "userId" FROM "temporary_contact"`);
        await queryRunner.query(`DROP TABLE "temporary_contact"`);
        await queryRunner.query(`DROP TABLE "contact"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
