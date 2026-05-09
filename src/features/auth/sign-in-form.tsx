import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { AlertCircle, Key } from "lucide-react";
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
import { useLogin } from "@/features/auth/auth-hooks";
import { useTranslation } from "@/lib/intl/react";
import { cn } from "@/lib/utils";

const signInSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

export default function SignInForm() {
  const { t } = useTranslation();
  const { loginWithCredentials, loginWithPasskey, loginWithSocial } = useLogin();

  const form = useAppForm({
    validators: {
      onChange: signInSchema,
    },
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    onSubmit: ({ value }) => {
      loginWithCredentials.mutate({
        email: value.email,
        password: value.password,
        rememberMe: value.rememberMe,
      });
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">{t("SIGN_IN")}</CardTitle>
        <CardDescription className="text-xs md:text-sm">{t("SIGN_IN_DESC")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          {loginWithCredentials.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {loginWithCredentials.error.message ||
                  "Login failed. Please check your credentials and try again."}
              </AlertDescription>
            </Alert>
          )}

          {loginWithPasskey.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {loginWithPasskey.error.message ||
                  "Passkey authentication failed. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          {loginWithSocial.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {loginWithSocial.error.message || "Social login failed. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          <form.AppField name="email">
            {(field) => (
              <field.InputField
                autoComplete="email"
                label={t("EMAIL")}
                placeholder="m@example.com"
                type="email"
              />
            )}
          </form.AppField>

          <form.AppField name="password">
            {(field) => (
              <field.PasswordField
                forgotPasswordHref="/forgot-password"
                forgotPasswordLabel={t("FORGOT_YOUR_PASSWORD")}
                label={t("PASSWORD")}
                placeholder="password"
              />
            )}
          </form.AppField>

          <form.AppField name="rememberMe">
            {(field) => <field.CheckboxField label={t("REMEMBER_ME")} />}
          </form.AppField>

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <ButtonGroup className="w-full">
                <Button
                  className="w-full"
                  disabled={!canSubmit || loginWithCredentials.isPending}
                  type="submit"
                >
                  {loginWithCredentials.isPending || isSubmitting ? <Spinner /> : t("LOGIN")}
                </Button>
              </ButtonGroup>
            )}
          </form.Subscribe>
        </form>

        <div className="mt-4 grid gap-4">
          <Button
            className="gap-2"
            onClick={() => {
              loginWithPasskey.mutate();
            }}
            type="button"
            variant="secondary"
          >
            <Key size={16} />
            {t("SIGN_IN_WITH_PASSKEY")}
            {loginWithPasskey.isPending && <Spinner />}
          </Button>

          <div className={cn("flex w-full items-center gap-2", "flex-col justify-between")}>
            <Button
              className={cn("w-full gap-2")}
              onClick={() => {
                loginWithSocial.mutate({
                  provider: "google",
                  callbackURL: "/dashboard",
                });
              }}
              type="button"
              variant="outline"
            >
              <SiGoogle size={16} />
              {t("SIGN_IN_WITH_GOOGLE")}
            </Button>
            <Button
              className={cn("w-full gap-2")}
              onClick={() => {
                loginWithSocial.mutate({
                  provider: "github",
                  callbackURL: "/dashboard",
                });
              }}
              type="button"
              variant="outline"
            >
              <SiGithub size={16} />
              {t("SIGN_IN_WITH_GITHUB")}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full justify-center border-t py-4">
          <p className="text-center text-xs text-neutral-500">
            {t("POWERED_BY")}{" "}
            <a
              className="underline"
              href="https://better-auth.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="dark:text-orange-200/90">better-auth.</span>
            </a>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
