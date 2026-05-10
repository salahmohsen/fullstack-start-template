import { Form } from "@base-ui/react";
import { Fingerprint, Plus } from "lucide-react";
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
import { FieldSet } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";

const addPasskeySchema = z.object({
  name: z.string().min(1, "Passkey name is required"),
});

export function AddPasskey() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const form = useAppForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onChange: addPasskeySchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const res = await authClient.passkey.addPasskey({
          name: value.name,
        });
        if (res?.error) {
          toast.error(res?.error.message);
        } else {
          setIsOpen(false);
          form.reset();
          toast.success("Passkey added successfully. You can now use it to login.");
        }
      } catch {
        toast.error("An error occurred while adding passkey");
      }
    },
  });

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger render={<Button className="gap-2 text-xs md:text-sm" variant="outline" />}>
        <Plus size={15} />
        {t("ADD_NEW_PASSKEY")}
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("ADD_NEW_PASSKEY")}</DialogTitle>
          <DialogDescription>{t("ADD_PASSKEY_DESC")}</DialogDescription>
        </DialogHeader>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldSet>
            <form.AppField name="name">
              {(field) => <field.InputGroupField label={t("PASSKEY_NAME")} />}
            </form.AppField>
          </FieldSet>
        </Form>
        <DialogFooter>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <ButtonGroup>
                <Button
                  className="w-full"
                  disabled={!canSubmit || isSubmitting}
                  onClick={() => {
                    form.handleSubmit();
                  }}
                  type="button"
                >
                  {isSubmitting ? (
                    <Spinner />
                  ) : (
                    <>
                      <Fingerprint className="mr-2 h-4 w-4" />
                      {t("CREATE_PASSKEY")}
                    </>
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
