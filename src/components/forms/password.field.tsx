import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { useFieldContext } from ".";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import type { FieldBaseProps } from "./field-types";
import { isFieldInvalid } from "./form-utls";

type PasswordFieldProps = React.ComponentProps<"input"> &
  FieldBaseProps & {
    forgotPasswordHref?: string;
    forgotPasswordLabel?: string;
  };

export function PasswordField({
  autoComplete = "current-password",
  classNames,
  description,
  forgotPasswordHref,
  forgotPasswordLabel = "Forgot password?",
  label,
  placeholder,
  readOnly,
}: PasswordFieldProps) {
  const field = useFieldContext<string>();
  const [showPassword, setShowPassword] = useState(false);
  const isInvalid = isFieldInvalid(field);

  return (
    <Field className={cn(classNames?.wrapper)} data-invalid={isInvalid || undefined}>
      <FieldLabel className={cn("sr-only", classNames?.label)} htmlFor={field.name}>
        {label}
      </FieldLabel>
      <div className="relative">
        <Input
          aria-invalid={isInvalid || undefined}
          autoComplete={autoComplete}
          className={cn("h-[42px] rounded-xl bg-input/50 px-3.5 py-2 pe-12", classNames?.field)}
          id={field.name}
          name={field.name}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          type={showPassword ? "text" : "password"}
          value={field.state.value}
        />
        <button
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute inset-y-0 end-3 flex items-center justify-center px-1 text-muted-foreground hover:text-foreground"
          onClick={() => setShowPassword((v) => !v)}
          tabIndex={-1}
          type="button"
        >
          {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
        </button>
      </div>
      {description ? (
        <FieldDescription className={classNames?.description}>{description}</FieldDescription>
      ) : null}
      {isInvalid ? (
        <FieldError className={classNames?.error} errors={field.state.meta.errors} />
      ) : null}
      {forgotPasswordHref ? (
        <a
          className={cn("self-end text-sm font-semibold text-primary", isInvalid && "mt-0.5")}
          href={forgotPasswordHref}
        >
          {forgotPasswordLabel}
        </a>
      ) : null}
    </Field>
  );
}
