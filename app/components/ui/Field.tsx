import type { ReactNode } from "react";

/**
 * Componentes de formulario reutilizables para el CMS (y futura refactor del público).
 * Estilo coherente: labels mayúsculas tracking, inputs con borde hairline,
 * foco en tinta. Sin sombras, sin emojis.
 */

const labelCls =
  "mb-1.5 block text-[11px] font-medium uppercase tracking-[1.5px] text-brand-ink-soft";
const inputCls =
  "w-full border border-border bg-surface px-3 py-2.5 text-sm text-brand-ink transition-colors focus:border-brand-ink focus:outline-none placeholder:text-brand-ink-light";

export function Field({
  label,
  name,
  children,
  hint,
  required,
}: {
  label: string;
  name: string;
  children: ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className={labelCls} htmlFor={name}>
        {label}
        {required ? <span className="text-brand-ink"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-[11px] text-brand-ink-light">{hint}</p> : null}
    </div>
  );
}

export function TextInput({
  name,
  defaultValue,
  placeholder,
  type = "text",
  required,
  id,
  autoComplete,
}: {
  name: string;
  defaultValue?: string | number;
  placeholder?: string;
  type?: string;
  required?: boolean;
  id?: string;
  autoComplete?: string;
}) {
  return (
    <input
      id={id ?? name}
      name={name}
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      required={required}
      autoComplete={autoComplete}
      className={inputCls}
    />
  );
}

export function TextArea({
  name,
  defaultValue,
  placeholder,
  rows = 4,
  required,
  id,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  id?: string;
}) {
  return (
    <textarea
      id={id ?? name}
      name={name}
      defaultValue={defaultValue}
      placeholder={placeholder}
      rows={rows}
      required={required}
      className={inputCls}
    />
  );
}

export function Select({
  name,
  defaultValue,
  required,
  id,
  children,
}: {
  name: string;
  defaultValue?: string | number;
  required?: boolean;
  id?: string;
  children: ReactNode;
}) {
  return (
    <select
      id={id ?? name}
      name={name}
      defaultValue={defaultValue}
      required={required}
      className={inputCls}
    >
      {children}
    </select>
  );
}
