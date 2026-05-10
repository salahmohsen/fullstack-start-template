import { useRouter } from "@tanstack/react-router";
import { Edit, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

import { useAppForm } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/features/auth/auth-hooks";
import { authClient } from "@/lib/auth/auth-client";
import { convertImageToBase64 } from "@/lib/utils";

const changeUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  image: z.instanceof(File).or(z.undefined()),
});

export function ChangeUser() {
  const { t } = useTranslation();
  const { data } = useSession();
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const form = useAppForm({
    defaultValues: {
      name: "",
      image: undefined as File | undefined,
    } as z.infer<typeof changeUserSchema>,
    validators: {
      onChange: changeUserSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await authClient.updateUser({
          image: value.image ? await convertImageToBase64(value.image) : undefined,
          name: value.name ? value.name : undefined,
          fetchOptions: {
            onSuccess: () => {
              toast.success("User updated successfully");
            },
            onError: (error) => {
              toast.error(error.error.message);
            },
          },
        });
        form.reset();
        router.invalidate();
        setImagePreview(null);
        setOpen(false);
      } catch {
        toast.error("An error occurred while updating user");
      }
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setFieldValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    form.setFieldValue("image", undefined);
    setImagePreview(null);
  };
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button className="gap-2" size="sm" variant="secondary" />}>
        <Edit size={13} />
        {t("EDIT_USER")}
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("EDIT_USER")}</DialogTitle>
          <DialogDescription>{t("EDIT_USER_DESC")}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldSet>
            <form.AppField name="name">
              {(field) => (
                <field.InputGroupField label={t("FULL_NAME")} placeholder={data?.user.name} />
              )}
            </form.AppField>

            <form.AppField name="image">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>{t("PROFILE_IMAGE")}</FieldLabel>
                  <FieldContent>
                    {imagePreview && (
                      <div className="relative h-16 w-16 overflow-hidden rounded-sm">
                        <img
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                          src={imagePreview}
                        />
                      </div>
                    )}
                    <div className="flex w-full items-center gap-2">
                      <Input
                        accept="image/*"
                        className="w-full text-muted-foreground"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={handleImageChange}
                        type="file"
                      />
                      {imagePreview && <X className="cursor-pointer" onClick={clearImage} />}
                    </div>
                    <FieldError errors={field.state.meta.errors} />
                  </FieldContent>
                </Field>
              )}
            </form.AppField>
          </FieldSet>
        </form>
        <DialogFooter>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <ButtonGroup>
                <Button
                  disabled={!canSubmit || isSubmitting}
                  onClick={() => {
                    form.handleSubmit();
                  }}
                  type="button"
                >
                  {isSubmitting ? <Spinner /> : t("UPDATE")}
                </Button>
              </ButtonGroup>
            )}
          </form.Subscribe>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
