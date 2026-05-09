import { cn } from "@/lib/utils";

import { useFieldContext } from ".";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import type { FieldBaseProps } from "./field-types";
import { isFieldInvalid } from "./form-utls";

type InputField = React.ComponentProps<"input"> & FieldBaseProps;

export function InputField({
  autoComplete = "off",
  classNames,
  description,
  label,
  placeholder,
  readOnly,
  type = "text",
}: InputField) {
  const field = useFieldContext<string | number | readonly string[] | undefined>();
  const isInvalid = isFieldInvalid(field);

  return (
    <Field className={cn(classNames?.field)} data-invalid={isInvalid || undefined}>
      <FieldLabel className={cn("sr-only", classNames?.label)} htmlFor={field.name}>
        {label}
      </FieldLabel>
      <Input
        aria-invalid={isInvalid || undefined}
        autoComplete={autoComplete}
        className={cn("h-[42px] rounded-xl bg-input/50 px-3.5 py-2", classNames?.field)}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        type={type}
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
