import { AnimatePresence, motion } from "framer-motion";
import { ChevronDownIcon, MailPlus, PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import CopyButton from "@/components/copy-button";
import { useAppForm } from "@/components/forms";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/features/auth/auth-hooks";
import {
  useCancelInvitation,
  useCreateOrganization,
  useInviteMember,
  useOrganizations,
  useRemoveMember,
  useSetActiveOrganization,
} from "@/features/organization/organization-hooks";
import type { AuthClient } from "@/lib/auth/auth-client";
import { authClient } from "@/lib/auth/auth-client";
import { useTranslation } from "@/lib/intl/react";

type ActiveOrganization = Awaited<
  ReturnType<typeof authClient.organization.getFullOrganization>
>;

export function OrganizationCard(props: {
  session: AuthClient["$Infer"]["Session"] | null;
  activeOrganization: ActiveOrganization | null;
}) {
  const { t } = useTranslation();
  const { data: organizations } = useOrganizations();
  const setActiveOrganization = useSetActiveOrganization();
  const createOrganization = useCreateOrganization();
  const inviteMember = useInviteMember();
  const removeMember = useRemoveMember();
  const cancelInvitation = useCancelInvitation();

  const optimisticOrg =
    // TODO: Fix this type
    // @ts-expect-error
    props.activeOrganization as typeof setActiveOrganization.data.data;

  const [isRevoking, setIsRevoking] = useState<string[]>([]);
  const inviteVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
  };

  const { data } = useSession();
  const session = data || props.session;

  const currentMember = optimisticOrg?.members?.find(
    (member) => member.userId === session?.user.id,
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("ORGANIZATION")}</CardTitle>
        <div className="flex justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger
              nativeButton={false}
              render={
                <div className="flex cursor-pointer items-center gap-1" />
              }
            >
              <p className="text-sm">
                <span className="font-bold" />{" "}
                {optimisticOrg?.name || t("PERSONAL")}
              </p>
              <ChevronDownIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                className="py-1"
                onClick={async () => {
                  setActiveOrganization.mutate({
                    organizationId: null,
                  });
                }}
              >
                <p className="sm text-sm">{t("PERSONAL")}</p>
              </DropdownMenuItem>
              {organizations?.map((org) => (
                <DropdownMenuItem
                  className="py-1"
                  key={org.id}
                  onClick={async () => {
                    if (org.id === optimisticOrg?.id) {
                      return;
                    }

                    setActiveOrganization.mutate({
                      organizationId: org.id,
                    });
                  }}
                >
                  <p className="sm text-sm">{org.name}</p>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div>
            <CreateOrganizationDialog />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Avatar className="rounded-none">
            <AvatarImage
              className="h-full w-full rounded-none object-cover"
              src={optimisticOrg?.logo || ""}
            />
            <AvatarFallback className="rounded-none">
              {optimisticOrg?.name?.charAt(0) || "P"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p>{optimisticOrg?.name || t("PERSONAL")}</p>
            <p className="text-xs text-muted-foreground">
              {optimisticOrg?.members.length || 1} {t("MEMBERS")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="flex flex-grow flex-col gap-2">
            <p className="border-b-2 border-b-foreground/10 font-medium">
              {t("MEMBERS")}
            </p>
            <div className="flex flex-col gap-2">
              {optimisticOrg?.members.map((member) => (
                <div
                  className="flex items-center justify-between"
                  key={member.id}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9 sm:flex">
                      <AvatarImage
                        className="object-cover"
                        src={member.user.image || ""}
                      />
                      <AvatarFallback>
                        {member.user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">{member.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.role === "owner"
                          ? t("OWNER")
                          : member.role === "member"
                            ? t("MEMBER")
                            : t("ADMIN")}
                      </p>
                    </div>
                  </div>
                  {member.role !== "owner" &&
                    (currentMember?.role === "owner" ||
                      currentMember?.role === "admin") && (
                      <Button
                        onClick={() => {
                          removeMember.mutate({
                            userId: member.id,
                          });
                        }}
                        size="sm"
                        variant="destructive"
                      >
                        {currentMember?.id === member.id
                          ? t("LEAVE")
                          : t("REMOVE")}
                      </Button>
                    )}
                </div>
              ))}
              {!optimisticOrg?.id && (
                <div>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={session?.user.image || ""} />
                      <AvatarFallback>
                        {session?.user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">{session?.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("OWNER")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-grow flex-col gap-2">
            <p className="border-b-2 border-b-foreground/10 font-medium">
              {t("INVITES")}
            </p>
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {optimisticOrg?.invitations
                  .filter((invitation) => invitation.status === "pending")
                  .map((invitation) => (
                    <motion.div
                      animate="visible"
                      className="flex items-center justify-between"
                      exit="exit"
                      initial="hidden"
                      key={invitation.id}
                      layout
                      variants={inviteVariants}
                    >
                      <div>
                        <p className="text-sm">{invitation.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {invitation.role === "owner"
                            ? t("OWNER")
                            : invitation.role === "member"
                              ? t("MEMBER")
                              : t("ADMIN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          disabled={isRevoking.includes(invitation.id)}
                          onClick={() => {
                            setIsRevoking([...isRevoking, invitation.id]);
                            cancelInvitation.mutate(
                              {
                                invitationId: invitation.id,
                              },
                              {
                                onSuccess: () => {
                                  toast.message(
                                    "Invitation revoked successfully",
                                  );
                                  setIsRevoking(
                                    isRevoking.filter(
                                      (id) => id !== invitation.id,
                                    ),
                                  );
                                },
                                onError: () => {
                                  setIsRevoking(
                                    isRevoking.filter(
                                      (id) => id !== invitation.id,
                                    ),
                                  );
                                },
                              },
                            );
                          }}
                          size="sm"
                          variant="destructive"
                        >
                          {isRevoking.includes(invitation.id) ? (
                            <Spinner />
                          ) : (
                            t("REVOKE")
                          )}
                        </Button>
                        <div>
                          <CopyButton
                            textToCopy={`${window.location.origin}/accept-invitation/${invitation.id}`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
              {optimisticOrg?.invitations.length === 0 && (
                <motion.p
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                >
                  {t("NO_ACTIVE_INVITATIONS")}
                </motion.p>
              )}
              {!optimisticOrg?.id && (
                <Label className="text-xs text-muted-foreground">
                  {t("CANT_INVITE_PERSONAL")}
                </Label>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex w-full justify-end">
          <div>
            <div>{optimisticOrg?.id && <InviteMemberDialog />}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const createOrganizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  logo: z.instanceof(File).or(z.undefined()),
});

function CreateOrganizationDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const createOrganization = useCreateOrganization();

  const form = useAppForm({
    defaultValues: {
      name: "",
      slug: "",
      logo: undefined as File | undefined,
    } satisfies z.infer<typeof createOrganizationSchema>,
    validators: {
      onChange: createOrganizationSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        let logoBase64: string | undefined;
        if (value.logo) {
          logoBase64 = await convertImageToBase64(value.logo);
        }

        createOrganization.mutate(
          {
            name: value.name,
            slug: value.slug,
            logo: logoBase64,
          },
          {
            onSuccess: () => {
              toast.success("Organization created successfully");
              setOpen(false);
              form.reset();
              setLogoPreview(null);
              setIsSlugEdited(false);
            },
            onError: (error) => {
              toast.error(error.message);
            },
          },
        );
      } catch {
        toast.error("An error occurred while creating organization");
      }
    },
  });

  const convertImageToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setFieldValue("logo", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    form.setFieldValue("logo", undefined);
    setLogoPreview(null);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={<Button className="w-full gap-2" size="sm" variant="default" />}
      >
        <PlusIcon />
        <p>{t("NEW_ORGANIZATION")}</p>
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("NEW_ORGANIZATION")}</DialogTitle>
          <DialogDescription>{t("CREATE_ORGANIZATION")}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldSet>
            <FieldGroup>
              <form.AppField name="name">
                {(field) => (
                  <field.InputGroupField label={t("ORGANIZATION_NAME")}>
                    <InputGroupInput
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        const value = event.target.value;
                        field.handleChange(value);
                        if (!isSlugEdited) {
                          form.setFieldValue(
                            "slug",
                            value.trim().toLowerCase().replace(/\s+/g, "-"),
                          );
                        }
                      }}
                      placeholder={t("NAME")}
                      value={field.state.value}
                    />
                  </field.InputGroupField>
                )}
              </form.AppField>

              <form.AppField name="slug">
                {(field) => (
                  <field.InputGroupField label={t("ORGANIZATION_SLUG")}>
                    <InputGroupInput
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        setIsSlugEdited(true);
                        field.handleChange(event.target.value);
                      }}
                      placeholder="organization-slug"
                      value={field.state.value}
                    />
                  </field.InputGroupField>
                )}
              </form.AppField>

              <form.AppField name="logo">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>{t("LOGO")}</FieldLabel>
                    <FieldContent>
                      <Input
                        accept="image/*"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={handleLogoChange}
                        type="file"
                      />
                      {logoPreview && (
                        <div className="mt-2 flex items-center gap-2">
                          <img
                            alt="Logo preview"
                            className="h-16 w-16 rounded object-cover"
                            height={16}
                            src={logoPreview}
                            width={16}
                          />
                          <button
                            className="text-sm text-destructive hover:text-destructive/80"
                            onClick={clearLogo}
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </FieldContent>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.AppField>
            </FieldGroup>
          </FieldSet>
        </form>
        <DialogFooter>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <ButtonGroup>
                <Button
                  disabled={
                    !canSubmit || isSubmitting || createOrganization.isPending
                  }
                  onClick={() => {
                    void form.handleSubmit();
                  }}
                  type="button"
                >
                  {createOrganization.isPending || isSubmitting ? (
                    <Spinner />
                  ) : (
                    t("CREATE")
                  )}
                </Button>
              </ButtonGroup>
            )}
          </form.Subscribe>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const inviteMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "member"], {
    message: "Please select a role",
  }),
});

function InviteMemberDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const inviteMember = useInviteMember();

  const form = useAppForm({
    defaultValues: {
      email: "",
      role: "member" as "admin" | "member",
    },
    validators: {
      onChange: inviteMemberSchema,
    },
    onSubmit: async ({ value }) => {
      inviteMember.mutate(
        {
          email: value.email,
          role: value.role,
        },
        {
          onSuccess: () => {
            toast.success("Member invited successfully");
            form.reset();
            setOpen(false);
          },
          onError: (error) => {
            toast.error(error.message);
          },
        },
      );
    },
  });
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button className="w-full gap-2" size="sm" variant="secondary" />
        }
      >
        <MailPlus size={16} />
        <p>{t("INVITE_MEMBER")}</p>
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("INVITE_MEMBER")}</DialogTitle>
          <DialogDescription>{t("INVITE_MEMBER_DESC")}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldSet>
            <FieldGroup>
              <form.AppField name="email">
                {(field) => (
                  <field.InputGroupField label={t("EMAIL")}>
                    <InputGroupInput
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder={t("EMAIL")}
                      type="email"
                      value={field.state.value}
                    />
                  </field.InputGroupField>
                )}
              </form.AppField>

              <form.AppField name="role">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>{t("ROLE")}</FieldLabel>
                    <FieldContent>
                      <Select
                        onValueChange={(value) =>
                          field.handleChange(value as "admin" | "member")
                        }
                        value={field.state.value}
                      >
                        <SelectTrigger id={field.name}>
                          <SelectValue placeholder={`${t("SELECT_USER")}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">{t("ADMIN")}</SelectItem>
                          <SelectItem value="member">{t("MEMBER")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldContent>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.AppField>
            </FieldGroup>
          </FieldSet>
        </form>
        <DialogFooter>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <ButtonGroup>
                <Button
                  disabled={
                    !canSubmit || isSubmitting || inviteMember.isPending
                  }
                  onClick={() => {
                    void form.handleSubmit();
                  }}
                  type="button"
                >
                  {inviteMember.isPending || isSubmitting ? (
                    <Spinner />
                  ) : (
                    t("INVITE")
                  )}
                </Button>
              </ButtonGroup>
            )}
          </form.Subscribe>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
