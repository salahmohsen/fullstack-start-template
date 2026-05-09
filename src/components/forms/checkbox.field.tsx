import { cn } from "@/lib/utils";

import { useFieldContext } from ".";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import type { FieldBaseProps } from "./field-types";
import { isFieldInvalid } from "./form-utls";

type CheckboxFieldProps = FieldBaseProps & {
  disabled?: boolean;
};

export function CheckboxField({ classNames, description, disabled, label }: CheckboxFieldProps) {
  const field = useFieldContext<boolean>();
  const isInvalid = isFieldInvalid(field);

  return (
    <Field
      className={cn(classNames?.wrapper)}
      data-invalid={isInvalid || undefined}
      orientation="horizontal"
    >
      <Checkbox
        aria-invalid={isInvalid || undefined}
        checked={field.state.value}
        disabled={disabled}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onCheckedChange={(checked) => field.handleChange(checked === true)}
      />
      {label ? (
        <FieldLabel className={cn(classNames?.label)} htmlFor={field.name}>
          {label}
        </FieldLabel>
      ) : null}
      {description ? (
        <FieldDescription className={classNames?.description}>{description}</FieldDescription>
      ) : null}
      {isInvalid ? (
        <FieldError className={classNames?.error} errors={field.state.meta.errors} />
      ) : null}
    </Field>
  );
}
