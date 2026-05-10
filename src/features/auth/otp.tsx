import { useRouter } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { useAppForm } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useAuthHelpers } from "@/features/auth/auth-hooks";
import { useTranslation } from "@/lib/intl/react";

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});

export const OtpForm = () => {
  const { t } = useTranslation();
  const { sendOtp, verifyOtp } = useAuthHelpers();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const router = useRouter();

  // In a real app, this email would come from your authentication context
  const userEmail = "user@example.com";

  const form = useAppForm({
    defaultValues: {
      otp: "",
    },
    validators: {
      onChange: otpSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const res = await verifyOtp.mutateAsync({
          code: value.otp,
        });
        if (res.data) {
          setMessage(t("OTP_VALIDATED"));
          setIsError(false);
          setIsValidated(true);
          router.navigate({ to: "/" });
        } else {
          setIsError(true);
          setMessage(t("INVALID_OTP"));
        }
      } catch {
        setIsError(true);
        setMessage(t("INVALID_OTP"));
      }
    },
  });

  const requestOTP = async () => {
    await sendOtp.mutateAsync();
    setMessage(t("OTP_SENT"));
    setIsError(false);
    setIsOtpSent(true);
  };
  return (
    <main className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{t("TWO_FACTOR_AUTH")}</CardTitle>
          <CardDescription>{t("VERIFY_IDENTITY")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            {isOtpSent ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
              >
                <FieldSet>
                  <form.AppField name="otp">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>{t("ONE_TIME_PASSWORD")}</FieldLabel>
                        <FieldContent>
                          <p className="py-2 text-sm text-muted-foreground">
                            {t("CHECK_EMAIL_OTP")} {userEmail}
                          </p>
                          <InputGroup>
                            <InputGroupInput
                              id={field.name}
                              name={field.name}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              placeholder={t("ENTER_6_DIGIT")}
                              type="text"
                              value={field.state.value}
                            />
                          </InputGroup>
                        </FieldContent>
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  </form.AppField>
                </FieldSet>
                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                  {([canSubmit, isSubmitting]) => (
                    <ButtonGroup>
                      <Button
                        className="mt-4 w-full"
                        disabled={!canSubmit || isSubmitting || isValidated}
                        type="submit"
                      >
                        {isSubmitting ? <Spinner /> : t("VALIDATE_OTP")}
                      </Button>
                    </ButtonGroup>
                  )}
                </form.Subscribe>
              </form>
            ) : (
              <Button className="w-full" onClick={requestOTP}>
                <Mail className="mr-2 h-4 w-4" /> {t("SEND_OTP_EMAIL")}
              </Button>
            )}
          </div>
          {message && (
            <div
              className={`mt-4 flex items-center gap-2 ${isError ? "text-red-500" : "text-primary"}`}
            >
              {isError ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              <p className="text-sm">{message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};
