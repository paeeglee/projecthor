import type {
  BaseInputTemplateProps,
  FieldTemplateProps,
  ObjectFieldTemplateProps,
  WidgetProps,
} from "@rjsf/utils";
import { cn } from "@/lib/utils";

export function BaseInputTemplate(props: BaseInputTemplateProps) {
  const { id, value, required, disabled, readonly, onChange, onBlur, onFocus } =
    props;

  return (
    <input
      id={id}
      type="text"
      value={value ?? ""}
      required={required}
      disabled={disabled || readonly}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => onBlur(id, e.target.value)}
      onFocus={(e) => onFocus(id, e.target.value)}
      className="placeholder:text-text-muted border-border bg-surface text-text h-12 w-full min-w-0 rounded-md border px-3 py-2 text-base outline-none transition-colors focus-visible:border-primary focus-visible:ring-primary-light focus-visible:ring-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}

export function FieldTemplate(props: FieldTemplateProps) {
  const { id, label, required, children, errors, description } = props;

  if (id === "root") {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </label>
      {description && <p className="text-xs text-text-muted">{description}</p>}
      {children}
      {errors}
    </div>
  );
}

export function ObjectFieldTemplate(props: ObjectFieldTemplateProps) {
  return (
    <div className="flex flex-col gap-5">
      {props.properties.map((prop) => (
        <div key={prop.name}>{prop.content}</div>
      ))}
    </div>
  );
}

export function ErrorListTemplate() {
  return null;
}

export function FieldErrorTemplate(props: { errors?: string[] }) {
  if (!props.errors?.length) return null;
  return (
    <div className="mt-1">
      {props.errors.map((error) => (
        <p key={error} className="text-sm text-red-400">
          {error}
        </p>
      ))}
    </div>
  );
}

export function SelectWidget(props: WidgetProps) {
  const { id, options, value, disabled, onChange } = props;
  const { enumOptions } = options;

  if (!enumOptions) return null;

  return (
    <div id={id} className="flex flex-col gap-2">
      {enumOptions.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={String(option.value)}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors",
              isSelected
                ? "border-primary bg-primary/15 text-text"
                : "border-border bg-surface text-text-muted hover:border-text-muted",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
