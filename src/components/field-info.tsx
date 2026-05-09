import type { AnyFieldApi } from "@tanstack/react-form";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <p className="text-[0.8rem] font-medium text-destructive">
          {field.state.meta.errors.join(", ")}
        </p>
      ) : null}
    </>
  );
}
