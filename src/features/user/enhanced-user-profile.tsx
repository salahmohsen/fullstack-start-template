import { SiGithub, SiX } from "@icons-pack/react-simple-icons";
import {
  BadgeCheck,
  Calendar,
  Camera,
  Link as LinkIcon,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { useAppForm } from "@/components/forms";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth/auth-client";

// Validation schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  bio: z.string().max(500, "Bio must be less than 500 characters"),
  location: z.string().max(100, "Location must be less than 100 characters"),
  website: z.url("Please enter a valid URL").or(z.literal("")),
  github: z.string().max(50, "GitHub username must be less than 50 characters"),
  twitter: z.string().max(50, "Twitter handle must be less than 50 characters"),
});

export function EnhancedUserProfile() {
  const { data: session } = authClient.useSession();
  const [isEditing, setIsEditing] = useState(false);

  const form = useAppForm({
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      bio: "",
      location: "",
      website: "",
      github: "",
      twitter: "",
    },
    validators: {
      onChange: profileSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        console.log("Saving profile:", value);
        toast.success("Profile updated successfully");
        setIsEditing(false);
      } catch {
        toast.error("Failed to update profile");
      }
    },
  });

  // Reset form when session changes
  useEffect(() => {
    if (session?.user) {
      form.reset({
        name: session.user.name || "",
        email: session.user.email || "",
        bio: "",
        location: "",
        website: "",
        github: "",
        twitter: "",
      });
    }
  }, [form, session?.user]);

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <form.Subscribe
        selector={(state) => ({
          values: state.values,
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ values, canSubmit, isSubmitting }) => (
          <>
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    alt={session?.user?.name}
                    src={session?.user?.image || undefined}
                  />
                  <AvatarFallback className="text-lg">
                    {session?.user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <Button
                  className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full p-0"
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-semibold">
                    {values.name || session?.user?.name}
                  </h3>
                  {session?.user?.emailVerified && (
                    <Badge
                      className="border-blue-200 text-blue-600"
                      variant="outline"
                    >
                      <BadgeCheck className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {values.email || session?.user?.email}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {values.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {values.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Member since{" "}
                    {session?.user?.createdAt
                      ? new Date(session.user.createdAt).getFullYear()
                      : new Date().getFullYear()}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <ButtonGroup>
                    <Button
                      disabled={!canSubmit || isSubmitting}
                      onClick={() => {
                        void form.handleSubmit();
                      }}
                      size="sm"
                      type="button"
                    >
                      {isSubmitting ? <Spinner /> : "Save Changes"}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </ButtonGroup>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </form.Subscribe>
      <Separator />
      {/* Profile Fields */}
      {isEditing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <FieldSet>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <form.AppField name="name">
                  {(field) => (
                    <field.InputGroupField label="Display Name">
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        value={field.state.value}
                      />
                    </field.InputGroupField>
                  )}
                </form.AppField>

                <form.AppField name="email">
                  {(field) => (
                    <field.InputGroupField label="Email">
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        type="email"
                        value={field.state.value}
                      />
                    </field.InputGroupField>
                  )}
                </form.AppField>
              </div>

              <form.AppField name="bio">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
                    <FieldContent>
                      <Textarea
                        className="min-h-[100px]"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="Tell us a little bit about yourself"
                        value={field.state.value ?? ""}
                      />
                    </FieldContent>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.AppField>

              <div className="grid grid-cols-2 gap-4">
                <form.AppField name="location">
                  {(field) => (
                    <field.InputGroupField label="Location">
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        value={field.state.value ?? ""}
                      />
                    </field.InputGroupField>
                  )}
                </form.AppField>

                <form.AppField name="website">
                  {(field) => (
                    <field.InputGroupField label="Website">
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="https://example.com"
                        type="url"
                        value={field.state.value ?? ""}
                      />
                    </field.InputGroupField>
                  )}
                </form.AppField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <form.AppField name="github">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        GitHub Username
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <SiGithub size={16} />
                        </InputGroupAddon>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          placeholder="username"
                          value={field.state.value ?? ""}
                        />
                      </InputGroup>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                </form.AppField>

                <form.AppField name="twitter">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Twitter Handle
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <SiX size={16} />
                        </InputGroupAddon>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          placeholder="@username"
                          value={field.state.value ?? ""}
                        />
                      </InputGroup>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                </form.AppField>
              </div>
            </FieldGroup>
          </FieldSet>
        </form>
      ) : (
        <div className="grid gap-6">
          {/*<div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-medium text-muted-foreground text-sm">
                  Display Name
                </Label>
                <p className="text-sm">
                  {watchAll.name || session?.user?.name}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="font-medium text-muted-foreground text-sm">
                  Email
                </Label>
                <p className="text-sm">
                  {watchAll.email || session?.user?.email}
                </p>
              </div>
            </div>

            {watchAll.bio && (
              <div className="space-y-2">
                <Label className="font-medium text-muted-foreground text-sm">
                  Bio
                </Label>
                <p className="text-sm">{watchAll.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {watchAll.location && (
                <div className="space-y-2">
                  <Label className="font-medium text-muted-foreground text-sm">
                    Location
                  </Label>
                  <p className="text-sm">{watchAll.location}</p>
                </div>
              )}
              {watchAll.website && (
                <div className="space-y-2">
                  <Label className="font-medium text-muted-foreground text-sm">
                    Website
                  </Label>
                  <p className="text-sm">{watchAll.website}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {watchAll.github && (
                <div className="space-y-2">
                  <Label className="font-medium text-muted-foreground text-sm">
                    GitHub
                  </Label>
                  <p className="text-sm">@{watchAll.github}</p>
                </div>
              )}
              {watchAll.twitter && (
                <div className="space-y-2">
                  <Label className="font-medium text-muted-foreground text-sm">
                    Twitter
                  </Label>
                  <p className="text-sm">{watchAll.twitter}</p>
                </div>
              )}
            </div>
          </div>*/}
        </div>
      )}
      <Separator />
      {/* Profile Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Active memberships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
      </div>
      {/* Social Links */}
      {!isEditing && (
        <form.Subscribe
          selector={({ values }) => ({
            website: values.website,
            github: values.github,
            twitter: values.twitter,
            location: values.location,
          })}
        >
          {({ website, github, twitter }) => {
            if (!website && !github && !twitter) return null;
            return (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Links</Label>
                <div className="flex gap-4">
                  {website && (
                    <Button
                      render={(props) => (
                        <a
                          {...props}
                          href={website}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {props.children}
                        </a>
                      )}
                      size="sm"
                      variant="outline"
                    >
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Website
                    </Button>
                  )}
                  {github && (
                    <Button
                      render={(props) => (
                        <a
                          {...props}
                          href={`https://github.com/${github}`}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {props.children}
                        </a>
                      )}
                      size="sm"
                      variant="outline"
                    >
                      <SiGithub className="mr-2" size={16} />
                      GitHub
                    </Button>
                  )}
                  {twitter && (
                    <Button
                      render={(props) => (
                        <a
                          {...props}
                          href={`https://twitter.com/${twitter.replace("@", "")}`}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {props.children}
                        </a>
                      )}
                      size="sm"
                      variant="outline"
                    >
                      <SiX className="mr-2" size={16} />
                      Twitter
                    </Button>
                  )}
                </div>
              </div>
            );
          }}
        </form.Subscribe>
      )}
    </div>
  );
}
