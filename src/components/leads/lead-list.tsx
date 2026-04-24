"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { LeadStatusBadge } from "@/components/leads/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LeadListItem } from "@/types/domain";

function getDDayInfo(dateStr: string | null): { label: string; color: string; isUrgent: boolean } | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `D+${Math.abs(diffDays)}`, color: "#DC2626", isUrgent: true };
  if (diffDays === 0) return { label: "D-Day", color: "#DC2626", isUrgent: true };
  if (diffDays <= 3) return { label: `D-${diffDays}`, color: "#DC2626", isUrgent: true };
  if (diffDays <= 7) return { label: `D-${diffDays}`, color: "#CA8A04", isUrgent: false };
  return { label: `D-${diffDays}`, color: "#16A34A", isUrgent: false };
}

function NextContactLabel({ date }: { date: string | null }) {
  const info = getDDayInfo(date);
  if (!info) return <p className="text-[13px] text-[#A3A3A3]">미정</p>;

  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[12px] font-bold text-white"
        style={{ backgroundColor: info.color }}
      >
        {info.label}
      </span>
      <span className="text-[12px] text-[#A3A3A3]">{date}</span>
    </div>
  );
}

type LeadListProps = {
  leads: LeadListItem[];
};

function LeadCard({ lead }: { lead: LeadListItem }) {
  const info = getDDayInfo(lead.nextContactDate);
  const barColor = info?.isUrgent ? info.color : "#E5E5E5";

  return (
    <Link href={`/leads/${lead.id}`} className="card-hover group relative block overflow-hidden rounded-xl border border-[#E5E5E5] bg-white p-4 hover:bg-[#EFF6FF] sm:p-5">
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: barColor }} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-[#0A0A0A]">{lead.guardianName}</p>
          <p className="mt-0.5 text-[13px] text-[#737373]">{lead.phone}</p>
        </div>
        <LeadStatusBadge status={lead.status} />
      </div>

      <p className="mt-3 line-clamp-2 text-[13px] leading-[1.6] text-[#737373]">{lead.careSummary}</p>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[#E5E5E5] pt-3 sm:grid-cols-3">
        <div>
          <p className="text-[13px] font-medium text-[#A3A3A3]">유입경로</p>
          <p className="text-[13px] text-[#0A0A0A]">{lead.source}</p>
        </div>
        <div>
          <p className="text-[13px] font-medium text-[#A3A3A3]">다음 연락</p>
          <NextContactLabel date={lead.nextContactDate} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-[13px] font-medium text-[#A3A3A3]">최근 상담</p>
          <p className="text-[13px] font-medium text-[#0A0A0A]">{lead.latestConsultationDate || "-"}</p>
        </div>
      </div>
    </Link>
  );
}

export function LeadList({ leads }: LeadListProps) {
  const router = useRouter();

  return (
    <>
      {/* Mobile/Tablet: Card layout */}
      <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:hidden">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>

      {/* Desktop: shadcn Table */}
      <section className="hidden overflow-hidden rounded-xl border border-[#E5E5E5] bg-white lg:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FAFAFA] hover:bg-[#FAFAFA]">
              <TableHead className="px-5 text-[13px] font-medium text-[#737373]">보호자</TableHead>
              <TableHead className="px-5 text-[13px] font-medium text-[#737373]">연락처</TableHead>
              <TableHead className="px-5 text-[13px] font-medium text-[#737373]">케어 대상</TableHead>
              <TableHead className="px-5 text-[13px] font-medium text-[#737373]">유입경로</TableHead>
              <TableHead className="px-5 text-[13px] font-medium text-[#737373]">상태</TableHead>
              <TableHead className="px-5 text-[13px] font-medium text-[#737373]">다음 연락</TableHead>
              <TableHead className="px-5 text-[13px] font-medium text-[#737373]">최근 상담</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow
                key={lead.id}
                onClick={() => router.push(`/leads/${lead.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/leads/${lead.id}`);
                  }
                }}
                tabIndex={0}
                role="link"
                className="cursor-pointer hover:bg-[#EFF6FF] focus-visible:bg-[#EFF6FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2563EB]/40"
              >
                <TableCell className="px-5 py-4 text-[15px] font-semibold text-[#0A0A0A]">{lead.guardianName}</TableCell>
                <TableCell className="px-5 py-4 text-[15px] text-[#0A0A0A]">{lead.phone}</TableCell>
                <TableCell className="px-5 py-4 text-[15px] leading-[1.6] text-[#737373]">{lead.careSummary}</TableCell>
                <TableCell className="px-5 py-4 text-[15px] text-[#737373]">{lead.source}</TableCell>
                <TableCell className="px-5 py-4"><LeadStatusBadge status={lead.status} /></TableCell>
                <TableCell className="px-5 py-4">
                  {lead.nextContactDate ? <NextContactLabel date={lead.nextContactDate} /> : <p className="text-[15px] text-[#A3A3A3]">미정</p>}
                </TableCell>
                <TableCell className="px-5 py-4 text-[15px] font-medium text-[#0A0A0A]">{lead.latestConsultationDate || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </>
  );
}
