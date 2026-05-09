"use client";

import { createFormHook, createFormHookContexts } from "@tanstack/react-form-start";

import { CheckboxField } from "./checkbox.field";
import { InputGroupField, InputGroupTextareaField } from "./input-group-input-field";
import { InputField } from "./input.field";
import { PasswordField } from "./password.field";
import { TextareaField } from "./textarea.field";

export * from "./field-types";
export * from "./form-utls";
export * from "./input-group-input-field";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withFieldGroup, withForm, extendForm } = createFormHook({
  fieldComponents: {
    CheckboxField,
    InputField,
    InputGroupField,
    InputGroupTextareaField,
    PasswordField,
    TextareaField,
  },
  fieldContext,
  formComponents: {},
  formContext,
});
