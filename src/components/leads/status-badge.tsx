import { getStatusLabel, type LeadStatus } from "@/types/domain";

type LeadStatusBadgeProps = {
  status: LeadStatus;
};

// 각 상태별 전용 색상 팔레트: 배경, 텍스트, 테두리, 도트
const badgeStyles: Record<LeadStatus, string> = {
  신규: "border-[#FCA5A5]/50 bg-[#FEF2F2] text-[#B91C1C]",
  "1차답장": "border-[#FCD34D]/60 bg-[#FFFBEB] text-[#B45309]",
  인터뷰예정: "border-[#C4B5FD]/60 bg-[#F5F3FF] text-[#6D28D9]",
  인터뷰완료: "border-[#86EFAC]/60 bg-[#F0FDF4] text-[#15803D]",
  소개대기: "border-[#93C5FD]/60 bg-[#EFF6FF] text-[#1D4ED8]",
  보류: "border-[#D6D3D1] bg-[#F5F5F5] text-[#57534E]",
};

const dotStyles: Record<LeadStatus, string> = {
  신규: "bg-[#DC2626]",
  "1차답장": "bg-[#D97706]",
  인터뷰예정: "bg-[#8B5CF6]",
  인터뷰완료: "bg-[#16A34A]",
  소개대기: "bg-[#2563EB]",
  보류: "bg-[#A3A3A3]",
};

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap",
        badgeStyles[status],
      ].join(" ")}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotStyles[status]}`} />
      {getStatusLabel(status)}
    </span>
  );
}
