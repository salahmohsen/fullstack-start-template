import { expect, test } from "vitest";

import { resolveAuthBaseUrl } from "@/lib/auth/auth-base-url";

test("resolveAuthBaseUrl prefixes localhost-style values with http", () => {
  expect(resolveAuthBaseUrl("localhost:3000")).toBe("http://localhost:3000");
});

test("resolveAuthBaseUrl falls back to the current origin when the env var is missing", () => {
  expect(resolveAuthBaseUrl(undefined, "http://localhost:3000")).toBe("http://localhost:3000");
});

test("resolveAuthBaseUrl preserves valid absolute URLs", () => {
  expect(resolveAuthBaseUrl("https://example.com/")).toBe("https://example.com");
});
