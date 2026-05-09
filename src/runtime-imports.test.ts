import { expect, test } from "vitest";

test("landing page module imports successfully", async () => {
  const module = await import("@/routes/(public)/index");

  expect(module.Route).toBeDefined();
});

test("admin user list module imports successfully", async () => {
  const module = await import("@/features/user/admin-user-list");

  expect(module.AdminUserList).toBeDefined();
});

test("enhanced user profile module imports successfully", async () => {
  const module = await import("@/features/user/enhanced-user-profile");

  expect(module.EnhancedUserProfile).toBeDefined();
});

test("workspace page module imports successfully", async () => {
  const module = await import("@/features/workspace/workspace-page");

  expect(module.WorkspacePage).toBeDefined();
});

test("organization card module imports successfully", async () => {
  const module = await import("@/features/organization/organization-card");

  expect(module.OrganizationCard).toBeDefined();
});

test("add passkey module imports successfully", async () => {
  const module = await import("@/features/auth/add-passkey");

  expect(module.AddPasskey).toBeDefined();
});

test("two-factor setup module imports successfully", async () => {
  const module = await import("@/features/auth/two-factor");

  expect(module.default).toBeDefined();
});

test("email otp module imports successfully", async () => {
  const module = await import("@/features/auth/otp");

  expect(module.default).toBeDefined();
});

test("change user module imports successfully", async () => {
  const module = await import("@/features/auth/change-user");

  expect(module.ChangeUser).toBeDefined();
});

test("user card module imports successfully", async () => {
  const module = await import("@/features/user/user-card");

  expect(module.default).toBeDefined();
});
