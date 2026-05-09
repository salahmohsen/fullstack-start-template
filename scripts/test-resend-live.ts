import WelcomeEmail from "../src/components/emails/welcome-email";
import { env } from "../src/lib/env.server";
import { sendEmail } from "../src/lib/resend";

if (!env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY must be set to run the live Resend smoke test.");
}

if (!env.TEST_EMAIL) {
  throw new Error("TEST_EMAIL must be set to run the live Resend smoke test.");
}

const subject = `Resend live smoke test ${new Date().toISOString()}`;

const result = await sendEmail({
  subject,
  template: WelcomeEmail({ username: "Live Resend Test" }),
  to: env.TEST_EMAIL,
});

console.log(
  JSON.stringify(
    {
      from: env.EMAIL,
      result,
      subject,
      to: env.TEST_EMAIL,
    },
    null,
    2,
  ),
);
