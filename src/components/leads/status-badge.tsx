import type { LeadStatus } from "@/types/domain";

type LeadStatusBadgeProps = {
  status: LeadStatus;
};

const badgeStyles: Record<LeadStatus, { dot: string; text: string }> = {
  신규: { dot: "bg-[#DC2626]", text: "text-[#DC2626]" },
  "1차답장": { dot: "bg-[#D97706]", text: "text-[#D97706]" },
  인터뷰예정: { dot: "bg-[#CA8A04]", text: "text-[#CA8A04]" },
  인터뷰완료: { dot: "bg-[#16A34A]", text: "text-[#16A34A]" },
  소개대기: { dot: "bg-[#2563EB]", text: "text-[#78716C]" },
  보류: { dot: "bg-[#A8A29E]", text: "text-[#78716C]" },
};

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const style = badgeStyles[status];

  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium">
      <span className={`inline-block h-2 w-2 rounded-full ${style.dot}`} />
      <span className={style.text}>{status}</span>
    </span>
  );
}
