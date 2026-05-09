import { expect, test, vi } from "vitest";

import { createDevelopmentDatabaseEnsurer } from "@/lib/db/ensure-development-database";

test("createDevelopmentDatabaseEnsurer runs migrations once in development", async () => {
  const database = {};
  const prepareDatabase = vi.fn(async () => {});
  const runMigrate = vi.fn(async () => {});
  const ensureDevelopmentDatabase = createDevelopmentDatabaseEnsurer({
    database,
    migrationsFolder: "/tmp/migrations",
    nodeEnv: "development",
    prepareDatabase,
    runMigrate,
    vitest: undefined,
  });

  await Promise.all([ensureDevelopmentDatabase(), ensureDevelopmentDatabase()]);

  expect(prepareDatabase).toHaveBeenCalledTimes(1);
  expect(prepareDatabase).toHaveBeenCalledWith(database);
  expect(runMigrate).toHaveBeenCalledTimes(1);
  expect(runMigrate).toHaveBeenCalledWith(database, { migrationsFolder: "/tmp/migrations" });
  expect(prepareDatabase.mock.invocationCallOrder[0]).toBeLessThan(
    runMigrate.mock.invocationCallOrder[0],
  );
});

test("createDevelopmentDatabaseEnsurer skips migrations in production", async () => {
  const runMigrate = vi.fn(async () => {});
  const ensureDevelopmentDatabase = createDevelopmentDatabaseEnsurer({
    database: {},
    migrationsFolder: "/tmp/migrations",
    nodeEnv: "production",
    prepareDatabase: vi.fn(async () => {}),
    runMigrate,
    vitest: undefined,
  });

  await ensureDevelopmentDatabase();

  expect(runMigrate).not.toHaveBeenCalled();
});

test("createDevelopmentDatabaseEnsurer skips migrations during vitest", async () => {
  const runMigrate = vi.fn(async () => {});
  const ensureDevelopmentDatabase = createDevelopmentDatabaseEnsurer({
    database: {},
    migrationsFolder: "/tmp/migrations",
    nodeEnv: "development",
    prepareDatabase: vi.fn(async () => {}),
    runMigrate,
    vitest: "true",
  });

  await ensureDevelopmentDatabase();

  expect(runMigrate).not.toHaveBeenCalled();
});

test("createDevelopmentDatabaseEnsurer falls back to recovery when migrations fail", async () => {
  const database = {};
  const prepareDatabase = vi.fn(async () => {});
  const recoverFromFailure = vi.fn(async () => {});
  const runMigrate = vi.fn(async () => {
    throw new Error("relation already exists");
  });
  const ensureDevelopmentDatabase = createDevelopmentDatabaseEnsurer({
    database,
    migrationsFolder: "/tmp/migrations",
    nodeEnv: "development",
    prepareDatabase,
    recoverFromFailure,
    runMigrate,
    vitest: undefined,
  });

  await ensureDevelopmentDatabase();

  expect(prepareDatabase).toHaveBeenCalledWith(database);
  expect(runMigrate).toHaveBeenCalledWith(database, { migrationsFolder: "/tmp/migrations" });
  expect(recoverFromFailure).toHaveBeenCalledTimes(1);
  expect(recoverFromFailure).toHaveBeenCalledWith(database, expect.any(Error));
});
