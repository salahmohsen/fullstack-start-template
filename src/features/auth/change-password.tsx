import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";

import { useAppForm } from "@/components/forms";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { useTranslation } from "@/lib/intl/react";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    signOutDevices: z.boolean(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "The two passwords do not match.",
    path: ["confirmPassword"],
  });

export function ChangePassword() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const form = useAppForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      signOutDevices: false,
    },
    validators: {
      onChange: changePasswordSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const res = await authClient.changePassword({
          newPassword: value.newPassword,
          currentPassword: value.currentPassword,
          revokeOtherSessions: value.signOutDevices,
        });
        if (res.error) {
          toast.error(res.error.message || "Couldn't change your password! Make sure it's correct");
        } else {
          setOpen(false);
          form.reset();
          toast.success("Password changed successfully");
        }
      } catch {
        toast.error("An error occurred while changing password");
      }
    },
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={(props) => (
          <Button {...props} className="z-10 gap-2" size="sm" type="button" variant="outline">
            <svg height="1em" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg">
              <title>Change password</title>
              <path
                d="M2.5 18.5v-1h19v1zm.535-5.973l-.762-.442l.965-1.693h-1.93v-.884h1.93l-.965-1.642l.762-.443L4 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L4 10.835zm8 0l-.762-.442l.966-1.693H9.308v-.884h1.93l-.965-1.642l.762-.443L12 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L12 10.835zm8 0l-.762-.442l.966-1.693h-1.931v-.884h1.93l-.965-1.642l.762-.443L20 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L20 10.835z"
                fill="currentColor"
              />
            </svg>
            <span className="text-sm text-muted-foreground">{t("CHANGE_PASSWORD")}</span>
          </Button>
        )}
      />
      <DialogContent className="w-11/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("CHANGE_PASSWORD")}</DialogTitle>
          <DialogDescription>{t("CHANGE_PASSWORD_DESC")}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.AppField name="currentPassword">
            {(field) => (
              <field.PasswordField
                autoComplete="current-password"
                label={t("CURRENT_PASSWORD")}
                placeholder={t("CURRENT_PASSWORD")}
              />
            )}
          </form.AppField>

          <form.AppField name="newPassword">
            {(field) => (
              <field.PasswordField
                autoComplete="new-password"
                label={t("NEW_PASSWORD")}
                placeholder={t("NEW_PASSWORD")}
              />
            )}
          </form.AppField>

          <form.AppField name="confirmPassword">
            {(field) => (
              <field.PasswordField
                autoComplete="new-password"
                label={t("CONFIRM_PASSWORD")}
                placeholder={t("CONFIRM_PASSWORD")}
              />
            )}
          </form.AppField>

          <form.AppField name="signOutDevices">
            {(field) => <field.CheckboxField label={t("SIGN_OUT_DEVICES")} />}
          </form.AppField>

          <DialogFooter>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button disabled={!canSubmit || isSubmitting} type="submit">
                  {isSubmitting ? <Spinner /> : t("CHANGE_PASSWORD")}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
