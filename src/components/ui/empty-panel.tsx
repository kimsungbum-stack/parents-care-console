import Link from "next/link";
import { Inbox } from "lucide-react";

type EmptyPanelProps = {
  title: string;
  description: string;
  compact?: boolean;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyPanel({ title, description, compact = false, actionLabel, actionHref }: EmptyPanelProps) {
  return (
    <div
      className={[
        "rounded-xl border border-dashed border-[#E5E5E5] bg-white text-center",
        compact ? "px-5 py-10" : "px-6 py-16",
      ].join(" ")}
    >
      <div
        className={[
          "mx-auto flex items-center justify-center rounded-full bg-[#FFEDD5] text-[#D97706]",
          compact ? "mb-3 h-14 w-14" : "mb-4 h-16 w-16",
        ].join(" ")}
      >
        <Inbox size={compact ? 26 : 30} strokeWidth={1.8} />
      </div>
      <p className={compact ? "text-[15px] font-semibold text-[#0A0A0A]" : "text-[17px] font-bold text-[#0A0A0A]"}>
        {title}
      </p>
      <p className="mx-auto mt-1.5 max-w-md text-[14px] leading-[1.6] text-[#737373]">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex min-h-[44px] items-center gap-1 rounded-lg bg-[#D97706] px-5 py-2.5 text-[14px] font-bold text-white shadow-sm transition-all duration-150 hover:bg-[#B45309] hover:shadow-md active:scale-[0.97]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
