import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

async function loadPostgresPlugin() {
  vi.resetModules();
  const pluginModuleUrl = new URL(
    "./node_modules/vite-plugin-neon-new/dist/index.js",
    import.meta.url,
  ).href;
  const { postgres } = await import(pluginModuleUrl);
  return postgres as (options: { referrer: string }) => {
    config?: (...args: Array<unknown>) => Promise<void> | void;
    name: string;
  };
}

async function createTempRoot(dotEnvContents?: string) {
  const root = await mkdtemp(join(tmpdir(), "neon-new-test-"));

  if (dotEnvContents !== undefined) {
    await writeFile(join(root, ".env"), dotEnvContents, "utf8");
  }

  return root;
}

describe("vite-plugin-neon-new", () => {
  it("does not create a database when the plugin is constructed", async () => {
    const postgres = await loadPostgresPlugin();

    const plugin = postgres({
      referrer: "test",
    });

    expect(plugin.name).toBe("vite-plugin-neon-new");
    expect(typeof plugin.config).toBe("function");
  });

  it.skipIf(process.env.RUN_NEON_LIVE_TEST !== "true")(
    "creates a claimable database during vite dev when DATABASE_URL is missing",
    async () => {
      const root = await createTempRoot();
      const originalCwd = process.cwd();
      const originalDatabaseUrl = process.env.DATABASE_URL;
      delete process.env.DATABASE_URL;
      const postgres = await loadPostgresPlugin();
      const plugin = postgres({
        referrer: "test",
      });

      try {
        process.chdir(root);
        await plugin.config?.(
          {
            root,
          },
          {
            command: "serve",
            mode: "development",
          },
        );

        const dotEnvContents = await readFile(join(root, ".env"), "utf8");

        expect(dotEnvContents).toContain("DATABASE_URL=");
        expect(dotEnvContents).toContain("DATABASE_URL_DIRECT=");
        expect(dotEnvContents).toContain("VITE_POSTGRES_CLAIM_URL=");
      } finally {
        process.chdir(originalCwd);
        process.env.DATABASE_URL = originalDatabaseUrl;
        await rm(root, { force: true, recursive: true });
      }
    },
  );

  it("does not create a database when DATABASE_URL already exists", async () => {
    const existingEnv = "DATABASE_URL=postgres://existing-db\n";
    const root = await createTempRoot(existingEnv);
    const postgres = await loadPostgresPlugin();
    const plugin = postgres({
      referrer: "test",
    });

    try {
      await plugin.config?.(
        {
          root,
        },
        {
          command: "serve",
          mode: "development",
        },
      );

      const dotEnvContents = await readFile(join(root, ".env"), "utf8");

      expect(dotEnvContents).toBe(existingEnv);
      expect(dotEnvContents).not.toContain("VITE_POSTGRES_CLAIM_URL=");
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it("is a noop in production mode", async () => {
    const root = await createTempRoot();
    const postgres = await loadPostgresPlugin();
    const plugin = postgres({
      referrer: "test",
    });

    try {
      await plugin.config?.(
        {
          root,
        },
        {
          command: "build",
          mode: "production",
        },
      );

      const dotEnvContents = await readFile(join(root, ".env"), "utf8").catch(() => "");

      expect(dotEnvContents).toBe("");
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });
});
