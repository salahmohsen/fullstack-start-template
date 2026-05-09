import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";

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
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { useTranslation } from "@/lib/intl/react";
import { convertImageToBase64 } from "@/lib/utils";

const signUpSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "The two passwords do not match.",
    path: ["passwordConfirmation"],
  });

export function SignUpForm() {
  const { t } = useTranslation();
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
    validators: {
      onChange: ({ value }) => {
        const result = signUpSchema.safeParse(value);
        if (!result.success) {
          return z.flattenError(result.error).fieldErrors;
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        await authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: `${value.firstName} ${value.lastName}`,
          image: imageFile ? await convertImageToBase64(imageFile) : "",
          callbackURL: "/dashboard",
          fetchOptions: {
            onError: (ctx) => {
              toast.error(ctx.error.message);
            },
            onSuccess: async () => {
              await navigate({ to: "/dashboard" });
            },
          },
        });
      } catch {
        toast.error("An error occurred during sign up");
      }
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(undefined);
    setImagePreview(null);
  };

  return (
    <Card className="z-50 max-w-md rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">{t("SIGN_UP")}</CardTitle>
        <CardDescription className="text-xs md:text-sm">{t("SIGN_UP_DESC")}</CardDescription>
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
          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="firstName">
              {(field) => (
                <field.InputField
                  autoComplete="given-name"
                  label={t("FIRST_NAME")}
                  placeholder="Max"
                />
              )}
            </form.AppField>

            <form.AppField name="lastName">
              {(field) => (
                <field.InputField
                  autoComplete="family-name"
                  label={t("LAST_NAME")}
                  placeholder="Robinson"
                />
              )}
            </form.AppField>
          </div>

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
                autoComplete="new-password"
                label={t("PASSWORD")}
                placeholder={t("PASSWORD")}
              />
            )}
          </form.AppField>

          <form.AppField name="passwordConfirmation">
            {(field) => (
              <field.PasswordField
                autoComplete="new-password"
                label={t("CONFIRM_PASSWORD")}
                placeholder={t("CONFIRM_PASSWORD")}
              />
            )}
          </form.AppField>

          <Field>
            <FieldLabel htmlFor="image">{t("PROFILE_IMAGE")}</FieldLabel>
            <FieldContent>
              <Input accept="image/*" id="image" onChange={handleImageChange} type="file" />
              {imagePreview && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    alt="Profile preview"
                    className="h-16 w-16 rounded object-cover"
                    height={64}
                    src={imagePreview}
                    width={64}
                  />
                  <button
                    className="text-sm text-destructive hover:text-destructive/80"
                    onClick={clearImage}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              )}
            </FieldContent>
          </Field>

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <ButtonGroup>
                <Button className="w-full" disabled={!canSubmit || isSubmitting} type="submit">
                  {isSubmitting ? <Spinner /> : t("CREATE_ACCOUNT")}
                </Button>
              </ButtonGroup>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
      <CardFooter>
        <div className="flex w-full justify-center border-t py-4">
          <p className="text-center text-xs text-neutral-500">
            {t("SECURED_BY")} <span className="text-orange-400">better-auth.</span>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
