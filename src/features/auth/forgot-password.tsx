import { Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import * as z from "zod";

import { useAppForm } from "@/components/forms";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Spinner } from "@/components/ui/spinner";
import { useAuthHelpers } from "@/features/auth/auth-hooks";
import { useTranslation } from "@/lib/intl/react";

const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export default function ForgotPasswordForm() {
  const { t } = useTranslation();
  const { forgotPassword } = useAuthHelpers();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await forgotPassword.mutateAsync({ email: value.email });
        setIsSubmitted(true);
      } catch {
        // error handled by mutation
      }
    },
  });

  if (isSubmitted) {
    return (
      <main className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>{t("CHECK_EMAIL")}</CardTitle>
            <CardDescription>{t("PASSWORD_RESET_LINK_SENT")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{t("CHECK_SPAM")}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => setIsSubmitted(false)}
              type="button"
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("BACK_TO_RESET")}
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{t("FORGOT_PASSWORD")}</CardTitle>
          <CardDescription>{t("FORGOT_PASSWORD_DESC")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <form.AppField name="email">
              {(field) => (
                <field.InputField
                  autoComplete="email"
                  label={t("EMAIL")}
                  placeholder={t("ENTER_EMAIL")}
                  type="email"
                />
              )}
            </form.AppField>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <ButtonGroup>
                  <Button
                    className="mt-4 w-full"
                    disabled={!canSubmit || forgotPassword.isPending || isSubmitting}
                    type="submit"
                  >
                    {isSubmitting || forgotPassword.isPending ? <Spinner /> : t("SEND_RESET_LINK")}
                  </Button>
                </ButtonGroup>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/login">
            <Button className="px-0" variant="link">
              {t("BACK_TO_SIGN_IN")}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
