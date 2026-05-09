import { expect, test } from "vitest";

import { resolveBetterAuthSecret } from "@/lib/auth/auth-secret";

test("resolveBetterAuthSecret returns the configured secret when present", () => {
  expect(resolveBetterAuthSecret("custom-secret", "development")).toBe("custom-secret");
});

test("resolveBetterAuthSecret falls back to a development secret outside production", () => {
  expect(resolveBetterAuthSecret(undefined, "development")).toBe("development-better-auth-secret");
});

test("resolveBetterAuthSecret throws in production when the secret is missing", () => {
  expect(() => resolveBetterAuthSecret(undefined, "production")).toThrow(
    "BETTER_AUTH_SECRET must be set in production",
  );
});
