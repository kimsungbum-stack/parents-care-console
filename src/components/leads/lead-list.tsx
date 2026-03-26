import Link from "next/link";

import { LeadStatusBadge } from "@/components/leads/status-badge";
import type { LeadListItem } from "@/types/domain";

function isOverdue(dateStr: string | null) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) < today;
}

function isToday(dateStr: string | null) {
  if (!dateStr) return false;
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

function NextContactLabel({ date }: { date: string | null }) {
  if (!date) return <p className="text-[13px] text-[#A8A29E]">미정</p>;
  if (isOverdue(date)) return <p className="text-[13px] font-semibold text-[#DC2626]">기한 초과</p>;
  if (isToday(date)) return <p className="text-[13px] font-semibold text-[#D97706]">오늘</p>;
  return <p className="text-[13px] font-medium text-[#292524]">{date}</p>;
}

type LeadListProps = {
  leads: LeadListItem[];
};

const columns = ["보호자", "연락처", "케어 대상", "유입경로", "상태", "다음 연락", "최근 상담"];

function LeadCard({ lead }: { lead: LeadListItem }) {
  const overdue = isOverdue(lead.nextContactDate);
  const todayContact = isToday(lead.nextContactDate);
  const barColor = overdue
    ? "#DC2626"
    : todayContact
      ? "#F59E0B"
      : "#E7E0D5";

  return (
    <Link href={`/leads/${lead.id}`} className="group relative block overflow-hidden rounded-xl border border-[#E7E0D5] bg-white p-4 transition-colors hover:bg-[#FEF3C7]/30 sm:p-5">
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: barColor }} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-[#292524]">{lead.guardianName}</p>
          <p className="mt-0.5 text-[13px] text-[#78716C]">{lead.phone}</p>
        </div>
        <LeadStatusBadge status={lead.status} />
      </div>

      <p className="mt-3 line-clamp-2 text-[13px] leading-[1.6] text-[#78716C]">{lead.careSummary}</p>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[#E7E0D5] pt-3 sm:grid-cols-3">
        <div>
          <p className="text-[13px] font-medium text-[#A8A29E]">유입경로</p>
          <p className="text-[13px] text-[#292524]">{lead.source}</p>
        </div>
        <div>
          <p className="text-[13px] font-medium text-[#A8A29E]">다음 연락</p>
          <NextContactLabel date={lead.nextContactDate} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-[13px] font-medium text-[#A8A29E]">최근 상담</p>
          <p className="text-[13px] font-medium text-[#292524]">{lead.latestConsultationDate || "-"}</p>
        </div>
      </div>
    </Link>
  );
}

function LeadTableRow({ lead }: { lead: LeadListItem }) {
  return (
    <Link href={`/leads/${lead.id}`} className="group block transition-colors hover:bg-[#FEF3C7]/30">
      <div className="grid grid-cols-[1.1fr_1fr_1.7fr_1fr_1fr_0.95fr_0.95fr] items-center gap-4 px-5 py-4">
        <p className="text-[15px] font-semibold text-[#292524]">{lead.guardianName}</p>
        <p className="text-[15px] text-[#292524]">{lead.phone}</p>
        <p className="text-[15px] leading-[1.6] text-[#78716C]">{lead.careSummary}</p>
        <p className="text-[15px] text-[#78716C]">{lead.source}</p>
        <div><LeadStatusBadge status={lead.status} /></div>
        <div>{lead.nextContactDate ? <NextContactLabel date={lead.nextContactDate} /> : <p className="text-[15px] text-[#A8A29E]">미정</p>}</div>
        <p className="text-[15px] font-medium text-[#292524]">{lead.latestConsultationDate || "-"}</p>
      </div>
    </Link>
  );
}

export function LeadList({ leads }: LeadListProps) {
  return (
    <>
      {/* Mobile/Tablet: Card layout */}
      <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:hidden">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>

      {/* Desktop: Table layout */}
      <section className="hidden overflow-hidden rounded-xl border border-[#E7E0D5] bg-white lg:block">
        <div className="grid grid-cols-[1.1fr_1fr_1.7fr_1fr_1fr_0.95fr_0.95fr] gap-4 border-b border-[#E7E0D5] bg-[#FEFCF8] px-5 py-3">
          {columns.map((column) => (
            <p key={column} className="text-[13px] font-medium text-[#78716C]">
              {column}
            </p>
          ))}
        </div>

        <div className="divide-y divide-[#E7E0D5]/60">
          {leads.map((lead) => (
            <LeadTableRow key={lead.id} lead={lead} />
          ))}
        </div>
      </section>
    </>
  );
}
