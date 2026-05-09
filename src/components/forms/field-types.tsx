export interface FieldBaseProps {
  description?: string;
  label?: string;
  classNames?: FieldBaseClassNames;
}

export interface FieldBaseClassNames {
  wrapper?: string;
  label?: string;
  description?: string;
  field?: string;
  error?: string;
}
