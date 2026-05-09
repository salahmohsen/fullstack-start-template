import { fileURLToPath } from "node:url";

import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/neon-http/migrator";

type MigrationRunner<TDatabase> = (
  database: TDatabase,
  config: { migrationsFolder: string },
) => Promise<void>;
type DatabasePreparer<TDatabase> = (database: TDatabase) => Promise<void>;
type DatabaseRecovery<TDatabase> = (database: TDatabase, error: unknown) => Promise<void>;
type ExecutableDatabase = {
  execute: (statement: unknown) => Promise<unknown>;
};

type DevelopmentDatabaseEnsurerOptions<TDatabase> = {
  database: TDatabase;
  migrationsFolder: string;
  nodeEnv?: string;
  prepareDatabase: DatabasePreparer<TDatabase>;
  recoverFromFailure?: DatabaseRecovery<TDatabase>;
  runMigrate: MigrationRunner<TDatabase>;
  vitest?: string;
};

export function createDevelopmentDatabaseEnsurer<TDatabase>({
  database,
  migrationsFolder,
  nodeEnv,
  prepareDatabase,
  recoverFromFailure,
  runMigrate,
  vitest,
}: DevelopmentDatabaseEnsurerOptions<TDatabase>) {
  let readyPromise: Promise<void> | undefined;

  return async () => {
    if (nodeEnv === "production" || vitest === "true") {
      return;
    }

    readyPromise ??= (async () => {
      await prepareDatabase(database);

      try {
        await runMigrate(database, { migrationsFolder });
      } catch (error) {
        if (!recoverFromFailure) {
          throw error;
        }

        await recoverFromFailure(database, error);
      }
    })();

    await readyPromise;
  };
}

const migrationsFolder = fileURLToPath(new URL("./migrations", import.meta.url));

async function prepareDevelopmentDatabase(database: ExecutableDatabase) {
  await database.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);
}

async function recoverAuthSchema(database: ExecutableDatabase) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS "user" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "email" text NOT NULL,
      "email_verified" boolean NOT NULL DEFAULT false,
      "image" text,
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now(),
      "two_factor_enabled" boolean,
      "role" text,
      "banned" boolean,
      "ban_reason" text,
      "ban_expires" timestamp
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "user_email_unique" ON "user" ("email")`,
    `CREATE TABLE IF NOT EXISTS "session" (
      "id" text PRIMARY KEY NOT NULL,
      "expires_at" timestamp NOT NULL,
      "token" text NOT NULL,
      "created_at" timestamp NOT NULL,
      "updated_at" timestamp NOT NULL,
      "ip_address" text,
      "user_agent" text,
      "user_id" text NOT NULL,
      "impersonated_by" text,
      "active_organization_id" text
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "session_token_unique" ON "session" ("token")`,
    `CREATE TABLE IF NOT EXISTS "account" (
      "id" text PRIMARY KEY NOT NULL,
      "account_id" text NOT NULL,
      "provider_id" text NOT NULL,
      "user_id" text NOT NULL,
      "access_token" text,
      "refresh_token" text,
      "id_token" text,
      "access_token_expires_at" timestamp,
      "refresh_token_expires_at" timestamp,
      "scope" text,
      "password" text,
      "created_at" timestamp NOT NULL,
      "updated_at" timestamp NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "verification" (
      "id" text PRIMARY KEY NOT NULL,
      "identifier" text NOT NULL,
      "value" text NOT NULL,
      "expires_at" timestamp NOT NULL,
      "created_at" timestamp DEFAULT now(),
      "updated_at" timestamp DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS "organization" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "slug" text,
      "logo" text,
      "created_at" timestamp NOT NULL,
      "metadata" text
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "organization_slug_unique" ON "organization" ("slug")`,
    `CREATE TABLE IF NOT EXISTS "member" (
      "id" text PRIMARY KEY NOT NULL,
      "organization_id" text NOT NULL,
      "user_id" text NOT NULL,
      "role" text NOT NULL DEFAULT 'member',
      "created_at" timestamp NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "invitation" (
      "id" text PRIMARY KEY NOT NULL,
      "organization_id" text NOT NULL,
      "email" text NOT NULL,
      "role" text,
      "status" text NOT NULL DEFAULT 'pending',
      "expires_at" timestamp NOT NULL,
      "inviter_id" text NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "two_factor" (
      "id" text PRIMARY KEY NOT NULL,
      "secret" text NOT NULL,
      "backup_codes" text NOT NULL,
      "user_id" text NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "passkey" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text,
      "public_key" text NOT NULL,
      "user_id" text NOT NULL,
      "credential_i_d" text NOT NULL,
      "counter" integer NOT NULL,
      "device_type" text NOT NULL,
      "backed_up" boolean NOT NULL,
      "transports" text,
      "created_at" timestamp,
      "aaguid" text
    )`,
    `CREATE TABLE IF NOT EXISTS "oauth_application" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text,
      "icon" text,
      "metadata" text,
      "client_id" text,
      "client_secret" text,
      "redirect_u_r_ls" text,
      "type" text,
      "disabled" boolean,
      "user_id" text,
      "created_at" timestamp,
      "updated_at" timestamp
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "oauth_application_client_id_unique" ON "oauth_application" ("client_id")`,
    `CREATE TABLE IF NOT EXISTS "oauth_access_token" (
      "id" text PRIMARY KEY NOT NULL,
      "access_token" text,
      "refresh_token" text,
      "access_token_expires_at" timestamp,
      "refresh_token_expires_at" timestamp,
      "client_id" text,
      "user_id" text,
      "scopes" text,
      "created_at" timestamp,
      "updated_at" timestamp
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "oauth_access_token_access_token_unique" ON "oauth_access_token" ("access_token")`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "oauth_access_token_refresh_token_unique" ON "oauth_access_token" ("refresh_token")`,
    `CREATE TABLE IF NOT EXISTS "oauth_consent" (
      "id" text PRIMARY KEY NOT NULL,
      "client_id" text,
      "user_id" text,
      "scopes" text,
      "created_at" timestamp,
      "updated_at" timestamp,
      "consent_given" boolean
    )`,
  ];

  for (const statement of statements) {
    await database.execute(sql.raw(statement));
  }
}

let ensureDevelopmentDatabasePromise: Promise<() => Promise<void>> | undefined;

async function getEnsureDevelopmentDatabase() {
  ensureDevelopmentDatabasePromise ??= (async () => {
    const { db } = await import("@/lib/db");

    return createDevelopmentDatabaseEnsurer({
      database: db,
      migrationsFolder,
      nodeEnv: process.env.NODE_ENV,
      prepareDatabase: prepareDevelopmentDatabase,
      recoverFromFailure: recoverAuthSchema,
      runMigrate: migrate,
      vitest: process.env.VITEST,
    });
  })();

  return ensureDevelopmentDatabasePromise;
}

export async function ensureDevelopmentDatabase() {
  const runEnsureDevelopmentDatabase = await getEnsureDevelopmentDatabase();
  await runEnsureDevelopmentDatabase();
}
