import type { ReactElement } from "react";
import { render } from "react-email";
import { Resend } from "resend";

import { env } from "@/lib/env.server";

export async function sendEmail({
  subject,
  template,
  to,
}: {
  subject: string;
  template: ReactElement;
  to: string;
}) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not configured; skipping email delivery");
    return;
  }

  const resend = new Resend(env.RESEND_API_KEY);

  try {
    const html = await render(template);

    const { data } = await resend.emails.send({
      from: (() => {
        if (!env.EMAIL) {
          console.warn("EMAIL is not configured; using default", "noreply@example.com");
          return "noreply@example.com";
        }
        return env.EMAIL;
      })(),
      html,
      subject,
      to,
    });

    return data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
}
