import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
};

export function FormField({ label, required = false, error, children }: FormFieldProps) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center gap-1.5">
        <span className="text-[13px] font-medium text-[#292524]">{label}</span>
        {required ? (
          <span className="text-[13px] font-bold text-[#D97706]">*</span>
        ) : null}
      </div>
      {children}
      {error ? <p className="mt-1.5 text-[13px] text-[#DC2626]">{error}</p> : null}
    </label>
  );
}
