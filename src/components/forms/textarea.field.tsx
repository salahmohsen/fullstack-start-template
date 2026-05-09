import { cn } from "@/lib/utils";

import { useFieldContext } from ".";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import type { FieldBaseProps } from "./field-types";
import { isFieldInvalid } from "./form-utls";

type TextareaFieldProps = React.ComponentProps<"textarea"> & FieldBaseProps;

export function TextareaField({
  classNames,
  description,
  label,
  maxLength,
  placeholder,
  readOnly,
  rows,
}: TextareaFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = isFieldInvalid(field);

  return (
    <Field className={cn(classNames?.wrapper)} data-invalid={isInvalid || undefined}>
      {label ? (
        <FieldLabel className={cn(classNames?.label)} htmlFor={field.name}>
          {label}
        </FieldLabel>
      ) : null}
      <Textarea
        aria-invalid={isInvalid || undefined}
        className={cn(classNames?.field)}
        id={field.name}
        maxLength={maxLength}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        rows={rows}
        value={field.state.value}
      />
      {description ? (
        <FieldDescription className={classNames?.description}>{description}</FieldDescription>
      ) : null}
      {isInvalid ? (
        <FieldError className={classNames?.error} errors={field.state.meta.errors} />
      ) : null}
    </Field>
  );
}
