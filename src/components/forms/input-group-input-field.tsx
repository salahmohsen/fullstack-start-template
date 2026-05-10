import { cn } from "@/lib/utils";

import { useFieldContext } from ".";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { InputGroup, InputGroupInput, InputGroupTextarea } from "../ui/input-group";
import type { FieldBaseProps } from "./field-types";
import { isFieldInvalid } from "./form-utls";

type InputGroupFieldProps = React.ComponentProps<"input"> & FieldBaseProps;

export const InputGroupField = ({
  className,
  classNames,
  description,
  label,
  children,
  placeholder,
  ...props
}: InputGroupFieldProps) => {
  const field = useFieldContext<React.ComponentProps<"input">["value"]>();
  const isInvalid = isFieldInvalid(field);

  return (
    <Field className={cn(classNames?.wrapper)} data-invalid={isInvalid || undefined}>
      {label ? (
        <FieldLabel className={cn("sr-only", classNames?.label)} htmlFor={field.name}>
          {label}
        </FieldLabel>
      ) : null}
      <InputGroup>
        <InputGroupInput
          className={cn(
            "h-[42px] rounded-xl bg-input/50 px-3.5 py-2",
            classNames?.field,
            className,
          )}
          aria-invalid={isInvalid || undefined}
          autoComplete={props.autoComplete}
          id={field.name}
          name={field.name}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          placeholder={placeholder}
          value={field.state.value}
          {...props}
        />
        {children}
      </InputGroup>
      {description ? (
        <FieldDescription className={classNames?.description}>{description}</FieldDescription>
      ) : null}
      {isInvalid ? (
        <FieldError className={classNames?.error} errors={field.state.meta.errors} />
      ) : null}
    </Field>
  );
};

export const InputGroupTextareaField = ({ ...props }: React.ComponentProps<"textarea">) => {
  const field = useFieldContext<React.ComponentProps<"textarea">["value"]>();
  const isInvalid = isFieldInvalid(field);

  return (
    <InputGroupTextarea
      aria-invalid={isInvalid || undefined}
      id={field.name}
      name={field.name}
      onBlur={field.handleBlur}
      onChange={(event) => field.handleChange(event.target.value)}
      value={field.state.value}
      {...props}
    />
  );
};
