import { Inbox } from "lucide-react";

type EmptyPanelProps = {
  title: string;
  description: string;
  compact?: boolean;
};

export function EmptyPanel({ title, description, compact = false }: EmptyPanelProps) {
  return (
    <div className={["rounded-xl border border-dashed border-[#E7E0D5] bg-white text-center", compact ? "px-5 py-8" : "px-6 py-12"].join(" ")}>
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FEFCF8] text-[#A8A29E]">
        <Inbox size={20} />
      </div>
      <p className="text-[15px] font-semibold text-[#292524]">{title}</p>
      <p className="mt-1 text-[13px] leading-[1.6] text-[#78716C]">{description}</p>
    </div>
  );
}
