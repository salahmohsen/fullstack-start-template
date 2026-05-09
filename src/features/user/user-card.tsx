import { useNavigate } from "@tanstack/react-router";
import {
  Laptop,
  LogOut,
  PhoneIcon,
  QrCode,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { UAParser } from "ua-parser-js";
import { z } from "zod";

import CopyButton from "@/components/copy-button";
import { useAppForm } from "@/components/forms";
import { LanguageSwitch } from "@/components/language-switch";
import { AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldDescription, FieldGroup, FieldSet } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { AddPasskey } from "@/features/auth/add-passkey";
import { useAuthHelpers, useLogout } from "@/features/auth/auth-hooks";
import { ChangePassword } from "@/features/auth/change-password";
import { ChangeUser } from "@/features/auth/change-user";
import { ListPasskeys } from "@/features/auth/list-passkeys";
import type { AuthClient } from "@/lib/auth/auth-client";
import { authClient } from "@/lib/auth/auth-client";

// Validation schemas
const qrCodePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const twoFactorPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const twoFactorOtpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});

export default function UserCard(props: {
  activeSessions: AuthClient["$Infer"]["Session"]["session"][];
}) {
  const { t } = useTranslation();
  const logout = useLogout();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const {
    getTotpUri,
    enableTwoFactor,
    disableTwoFactor,
    verifyTotpForEnable,
    sendVerificationEmail,
    signOut,
    revokeSession,
  } = useAuthHelpers();
  const [isTerminating, setIsTerminating] = useState<string>();
  const [twoFactorDialog, setTwoFactorDialog] = useState<boolean>(false);
  const [twoFactorVerifyURI, setTwoFactorVerifyURI] = useState<string>("");

  const qrCodeForm = useAppForm({
    defaultValues: {
      password: "",
    },
    validators: {
      onChange: qrCodePasswordSchema,
    },
    onSubmit: async ({ value }) => {
      getTotpUri.mutate(
        { password: value.password },
        {
          onSuccess: (data) => {
            setTwoFactorVerifyURI(data.data?.totpURI || "");
            qrCodeForm.reset();
          },
          onError: (error) => {
            toast.error(error.message);
          },
        },
      );
    },
  });

  const twoFactorForm = useAppForm({
    defaultValues: {
      password: "",
      otp: "",
    },
    validators: {
      onChange: ({ value }) => {
        const result = twoFactorVerifyURI
          ? twoFactorOtpSchema.safeParse({ otp: value.otp })
          : twoFactorPasswordSchema.safeParse({ password: value.password });

        if (!result.success && result.error) {
          const fieldErrors = z.treeifyError(result.error).errors;
          return {
            otp: fieldErrors.otp,
            password: fieldErrors.password,
          };
        }

        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      if (session?.user.twoFactorEnabled) {
        disableTwoFactor.mutate(
          { password: value.password },
          {
            onSuccess: () => {
              toast("2FA disabled successfully");
              setTwoFactorDialog(false);
              twoFactorForm.reset();
            },
            onError: (error) => {
              toast.error(error.message);
            },
          },
        );
        return;
      }

      if (twoFactorVerifyURI) {
        verifyTotpForEnable.mutate(
          { code: value.otp },
          {
            onSuccess: () => {
              toast("2FA enabled successfully");
              setTwoFactorVerifyURI("");
              twoFactorForm.reset();
              setTwoFactorDialog(false);
            },
            onError: (error) => {
              twoFactorForm.setFieldValue("otp", "");
              toast.error(error.message);
            },
          },
        );
        return;
      }

      enableTwoFactor.mutate(
        { password: value.password },
        {
          onSuccess: (data) => {
            setTwoFactorVerifyURI(data.data?.totpURI || "");
          },
          onError: (error) => {
            toast.error(error.message);
          },
        },
      );
    },
  });

  const handleSendVerificationEmail = async () => {
    sendVerificationEmail.mutate(
      {
        email: session?.user.email || "",
      },
      {
        onError(error) {
          toast.error(error.message);
        },
        onSuccess() {
          toast.success("Verification email sent successfully");
        },
      },
    );
  };

  const handleRevokeSession = async (
    item: AuthClient["$Infer"]["Session"]["session"],
  ) => {
    setIsTerminating(item.id);
    const res = await revokeSession.mutateAsync({
      token: item.token,
    });

    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success("Session terminated successfully");
    }
    if (item.id === session?.session?.id) {
      signOut.mutate(undefined, {
        onSuccess() {
          setIsTerminating(undefined);
          navigate({ to: "/" });
        },
      });
    }
    setIsTerminating(undefined);
  };
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("USER")}</CardTitle>
        <LanguageSwitch />
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarImage
                alt="Avatar"
                className="object-cover"
                src={session?.user.image || undefined}
              />
              <AvatarFallback>{session?.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm leading-none font-medium">
                {session?.user.name}
              </p>
              <p className="text-sm">{session?.user.email}</p>
            </div>
          </div>
          <ChangeUser />
        </div>

        {session?.user.emailVerified ? null : (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <AlertTitle>{t("VERIFY_EMAIL")}</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                {t("VERIFY_EMAIL_DESC")}
              </AlertDescription>
              <Button
                className="mt-2"
                onClick={handleSendVerificationEmail}
                size="sm"
                variant="secondary"
              >
                {sendVerificationEmail.isPending ? (
                  <Spinner />
                ) : (
                  t("RESEND_VERIFICATION")
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="flex w-max flex-col gap-1 border-l-2 px-2">
          <p className="text-xs font-medium">{t("ACTIVE_SESSIONS")}</p>
          {props?.activeSessions
            ?.filter((item) => item.userAgent)
            .map((item) => (
              <div key={item.id}>
                <div className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
                  {new UAParser(item.userAgent || "").getDevice().type ===
                  "mobile" ? (
                    <PhoneIcon />
                  ) : (
                    <Laptop size={16} />
                  )}
                  {new UAParser(item.userAgent || "").getOS().name},{" "}
                  {new UAParser(item.userAgent || "").getBrowser().name}
                  <Button
                    className="min-w-[100px] cursor-pointer"
                    onClick={() => handleRevokeSession(item)}
                    variant="outline"
                  >
                    {isTerminating === item.id ? (
                      <Spinner />
                    ) : item.id === session?.session?.id ? (
                      t("SIGN_OUT")
                    ) : (
                      t("TERMINATE")
                    )}
                  </Button>
                </div>
              </div>
            ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-y py-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm">{t("PASSKEYS")}</p>
            <div className="flex flex-wrap gap-2">
              <AddPasskey />
              <ListPasskeys />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm">{t("TWO_FACTOR")}</p>
            <div className="flex gap-2">
              {!!session?.user.twoFactorEnabled && (
                <Dialog>
                  <DialogTrigger
                    render={<Button className="gap-2" variant="outline" />}
                  >
                    <QrCode size={16} />
                    <span className="text-xs md:text-sm">
                      {t("SCAN_QR_CODE")}
                    </span>
                  </DialogTrigger>
                  <DialogContent className="w-11/12 sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{t("SCAN_QR_CODE")}</DialogTitle>
                      <DialogDescription>{t("SCAN_QR_DESC")}</DialogDescription>
                    </DialogHeader>

                    {twoFactorVerifyURI ? (
                      <>
                        <div className="flex items-center justify-center">
                          <QRCode value={twoFactorVerifyURI} />
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            {t("COPY_URI")}
                          </p>
                          <CopyButton textToCopy={twoFactorVerifyURI} />
                        </div>
                      </>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          void qrCodeForm.handleSubmit();
                        }}
                      >
                        <FieldSet>
                          <FieldGroup>
                            <qrCodeForm.AppField name="password">
                              {(field) => (
                                <field.PasswordField
                                  label={t("ENTER_PASSWORD")}
                                  placeholder={t("ENTER_PASSWORD")}
                                />
                              )}
                            </qrCodeForm.AppField>
                          </FieldGroup>
                        </FieldSet>
                        <qrCodeForm.Subscribe
                          selector={(state) => [
                            state.canSubmit,
                            state.isSubmitting,
                          ]}
                        >
                          {([canSubmit, isSubmitting]) => (
                            <ButtonGroup>
                              <Button
                                disabled={
                                  !canSubmit ||
                                  isSubmitting ||
                                  getTotpUri.isPending
                                }
                                type="submit"
                              >
                                {isSubmitting || getTotpUri.isPending ? (
                                  <Spinner />
                                ) : (
                                  t("SHOW_QR_CODE")
                                )}
                              </Button>
                            </ButtonGroup>
                          )}
                        </qrCodeForm.Subscribe>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
              )}
              <Dialog onOpenChange={setTwoFactorDialog} open={twoFactorDialog}>
                <DialogTrigger
                  render={
                    <Button
                      className="gap-2"
                      variant={
                        session?.user.twoFactorEnabled
                          ? "destructive"
                          : "outline"
                      }
                    />
                  }
                >
                  {session?.user.twoFactorEnabled ? (
                    <ShieldOff size={16} />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                  <span className="text-xs md:text-sm">
                    {session?.user.twoFactorEnabled
                      ? t("DISABLE_2FA")
                      : t("ENABLE_2FA")}
                  </span>
                </DialogTrigger>
                <DialogContent className="w-11/12 sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {session?.user.twoFactorEnabled
                        ? t("DISABLE_2FA")
                        : t("ENABLE_2FA")}
                    </DialogTitle>
                    <DialogDescription>
                      {session?.user.twoFactorEnabled
                        ? t("DISABLE_2FA_DESC")
                        : t("ENABLE_2FA_DESC")}
                    </DialogDescription>
                  </DialogHeader>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void twoFactorForm.handleSubmit();
                    }}
                  >
                    <FieldSet>
                      <FieldGroup>
                        {twoFactorVerifyURI ? (
                          <>
                            <div className="flex items-center justify-center">
                              <QRCode value={twoFactorVerifyURI} />
                            </div>
                            <FieldDescription>
                              {t("SCAN_QR_DESC")}
                            </FieldDescription>
                            <twoFactorForm.AppField name="otp">
                              {(field) => (
                                <field.InputGroupField
                                  label={t("ENTER_OTP")}
                                  placeholder={t("ENTER_OTP")}
                                />
                              )}
                            </twoFactorForm.AppField>
                          </>
                        ) : (
                          <twoFactorForm.AppField name="password">
                            {(field) => (
                              <field.PasswordField
                                label={t("PASSWORD")}
                                placeholder={t("PASSWORD")}
                              />
                            )}
                          </twoFactorForm.AppField>
                        )}
                      </FieldGroup>
                    </FieldSet>
                    <DialogFooter>
                      <twoFactorForm.Subscribe
                        selector={(state) => [
                          state.canSubmit,
                          state.isSubmitting,
                        ]}
                      >
                        {([canSubmit, isSubmitting]) => (
                          <ButtonGroup>
                            <Button
                              disabled={
                                !canSubmit ||
                                isSubmitting ||
                                disableTwoFactor.isPending ||
                                enableTwoFactor.isPending ||
                                verifyTotpForEnable.isPending
                              }
                              type="submit"
                            >
                              {isSubmitting ||
                              disableTwoFactor.isPending ||
                              enableTwoFactor.isPending ||
                              verifyTotpForEnable.isPending ? (
                                <Spinner />
                              ) : session?.user.twoFactorEnabled ? (
                                t("DISABLE_2FA")
                              ) : (
                                t("ENABLE_2FA")
                              )}
                            </Button>
                          </ButtonGroup>
                        )}
                      </twoFactorForm.Subscribe>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="items-center justify-between gap-2">
        <ChangePassword />
        <Button
          className="z-10 gap-2"
          disabled={logout.isPending}
          onClick={async () => {
            // setIsSignOut(true);
            // await authClient.signOut({
            //   fetchOptions: {
            //     onSuccess() {
            //       navigate({ to: "/" });
            //     },
            //   },
            // });
            // setIsSignOut(false);
            logout.mutate();
          }}
          variant="secondary"
        >
          <span className="text-sm">
            {logout.isPending ? (
              <Spinner />
            ) : (
              <div className="flex items-center gap-2">
                <LogOut size={16} />
                {t("SIGN_OUT")}
              </div>
            )}
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}
