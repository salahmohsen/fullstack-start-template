import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { useAppForm } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldSet } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { useTranslation } from "@/lib/intl/react";

const twoFactorSchema = z.object({
  totpCode: z
    .string()
    .length(6, "TOTP code must be exactly 6 digits")
    .regex(/^\d+$/, "TOTP code must contain only digits"),
});

export default function Component() {
  const { t } = useTranslation();
  const [success, setSuccess] = useState(false);

  const form = useAppForm({
    defaultValues: {
      totpCode: "",
    },
    validators: {
      onChange: twoFactorSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const res = await authClient.twoFactor.verifyTotp({
          code: value.totpCode,
        });
        if (res.data?.token) {
          setSuccess(true);
        }
      } catch {
        // Error handling is done via form validation
      }
    },
  });

  return (
    <main className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{t("TOTP_VERIFICATION")}</CardTitle>
          <CardDescription>{t("ENTER_TOTP")}</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-lg font-semibold">
                {t("VERIFICATION_SUCCESSFUL")}
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              <FieldSet>
                <form.AppField name="totpCode">
                  {(field) => (
                    <field.InputGroupField
                      label={t("TOTP_CODE")}
                      placeholder={t("ENTER_6_DIGIT_CODE")}
                    />
                  )}
                </form.AppField>
              </FieldSet>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <ButtonGroup>
                    <Button
                      className="mt-4 w-full"
                      disabled={!canSubmit || isSubmitting}
                      type="submit"
                    >
                      {isSubmitting ? <Spinner /> : t("VERIFY")}
                    </Button>
                  </ButtonGroup>
                )}
              </form.Subscribe>
            </form>
          )}
        </CardContent>
        <CardFooter className="gap-2 text-sm text-muted-foreground">
          <Link to="/two-factor/otp">
            <Button size="sm" variant="link">
              {t("SWITCH_EMAIL_VERIFICATION")}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
