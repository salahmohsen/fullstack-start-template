import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import * as z from "zod";

import { useAppForm } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { useTranslation } from "@/lib/intl/react";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "The two passwords do not match.",
    path: ["confirmPassword"],
  });

export default function ResetPasswordForm() {
  const { t } = useTranslation();
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const res = await authClient.resetPassword({
          newPassword: value.password,
          token: new URLSearchParams(window.location.search).get("token") ?? "",
        });
        console.log("resetPassword", res);
        if (res.error) {
          toast.error(res.error.message);
        } else {
          await router.navigate({ to: "/login" });
        }
      } catch {
        toast.error("An error occurred during password reset");
      }
    },
  });

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{t("RESET_PASSWORD")}</CardTitle>
          <CardDescription>{t("RESET_PASSWORD_DESC")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <form.AppField name="password">
              {(field) => (
                <field.PasswordField
                  autoComplete="new-password"
                  label={t("NEW_PASSWORD")}
                  placeholder={t("PASSWORD")}
                />
              )}
            </form.AppField>

            <form.AppField name="confirmPassword">
              {(field) => (
                <field.PasswordField
                  autoComplete="new-password"
                  label={t("CONFIRM_NEW_PASSWORD")}
                  placeholder={t("PASSWORD")}
                />
              )}
            </form.AppField>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button className="w-full" disabled={!canSubmit || isSubmitting} type="submit">
                  {isSubmitting ? <Spinner /> : t("RESET_PASSWORD_BUTTON")}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
