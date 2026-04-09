import type { ReactNode } from "react";

type FormSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="rounded-xl border border-[#E5E5E5] bg-white p-5">
      <div className="mb-4 border-b border-[#E5E5E5] pb-4">
        <h3 className="text-[16px] font-bold text-[#0A0A0A]">{title}</h3>
        <p className="mt-1 text-[13px] leading-[1.6] text-[#737373]">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
