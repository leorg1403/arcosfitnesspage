import type { ReactNode } from "react";

type Props = {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
};

export function Field({ label, required, error, children }: Props) {
  return (
    <label className="block">
      <span className="block font-mono text-[0.625rem] uppercase tracking-[0.22em] text-concrete mb-1">
        {label}
        {required && <span className="text-gold ml-1">*</span>}
      </span>
      {children}
      {error && <span className="block text-xs text-red-400 mt-1">{error}</span>}
    </label>
  );
}
