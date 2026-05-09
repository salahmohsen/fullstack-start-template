import type { AnyFieldApi } from "@tanstack/react-form-start";

export function isFieldInvalid(field: AnyFieldApi) {
  return field.state.meta.isTouched && !field.state.meta.isValid;
}

export function scrollToFirstInvalidField(delay = 0) {
  const scroll = () => {
    if (typeof document === "undefined") return;

    const invalidElements = document.querySelectorAll("[data-invalid]");
    invalidElements[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (delay > 0) {
    setTimeout(scroll, delay);
    return;
  }

  scroll();
}
