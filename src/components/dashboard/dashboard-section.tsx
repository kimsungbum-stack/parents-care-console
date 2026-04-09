import type { ReactNode } from "react";

type DashboardSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function DashboardSection({
  title,
  description,
  children,
}: DashboardSectionProps) {
  return (
    <section className="rounded-xl border border-[#E5E5E5] bg-white">
      <div className="border-b border-[#E5E5E5] px-5 py-4">
        <h3 className="text-[16px] font-bold text-[#0A0A0A]">{title}</h3>
        <p className="mt-1 text-[13px] text-[#737373]">{description}</p>
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}
