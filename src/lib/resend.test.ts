import { beforeEach, expect, test, vi } from "vitest";

const testEmail = process.env.VITE_TEST_EMAIL ?? "dev@example.com";
const renderMock = vi.fn(async () => "<p>Hello</p>");
const sendMock = vi.fn(async () => ({ data: { id: "email-id" } }));
const ResendMock = vi.fn(function MockResend() {
  return {
    emails: {
      send: sendMock,
    },
  };
});

vi.mock("@react-email/render", () => ({
  render: renderMock,
}));

vi.mock("resend", () => ({
  Resend: ResendMock,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("sendEmail skips delivery when RESEND_API_KEY is missing", async () => {
  vi.resetModules();
  vi.doMock("@/lib/env.server", () => ({
    env: {
      EMAIL: undefined,
      RESEND_API_KEY: undefined,
    },
  }));

  const { sendEmail } = await import("@/lib/resend");
  const result = await sendEmail({
    subject: "This shouldn't send!",
    template: null as never,
    to: testEmail,
  });

  expect(result).toBeUndefined();
  expect(ResendMock).not.toHaveBeenCalled();
  expect(renderMock).not.toHaveBeenCalled();
});
