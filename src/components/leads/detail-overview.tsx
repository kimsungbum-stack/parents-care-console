import type { LeadDetail } from "@/types/domain";

type DetailOverviewProps = {
  lead: LeadDetail;
};

export function DetailOverview({ lead }: DetailOverviewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-[#E5E5E5] bg-white p-5">
        <p className="text-[16px] font-bold text-[#0A0A0A]">부모님 상황 요약</p>
        <p className="mt-2 text-[15px] leading-[1.6] text-[#737373]">{lead.parentSituationSummary}</p>
      </section>

      <section className="rounded-xl border border-[#E5E5E5] bg-white p-5">
        <p className="text-[16px] font-bold text-[#0A0A0A]">최근 상담일</p>
        <p className="mt-2 text-[15px] leading-[1.6] text-[#737373]">{lead.latestConsultationDate}</p>
      </section>

      <section className="rounded-xl border border-[#E5E5E5] bg-white p-5">
        <p className="text-[16px] font-bold text-[#0A0A0A]">핵심 문제</p>
        {lead.keyIssues.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {lead.keyIssues.map((issue) => (
              <span key={issue} className="rounded-full border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-1.5 text-[13px] font-medium text-[#0A0A0A]">
                {issue}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[15px] leading-[1.6] text-[#737373]">아직 정리된 핵심 문제가 없어요.</p>
        )}
      </section>

      <section className="rounded-xl border border-[#E5E5E5] bg-white p-5">
        <p className="text-[16px] font-bold text-[#0A0A0A]">현재 진행 상태</p>
        <p className="mt-2 text-[15px] leading-[1.6] text-[#737373]">{lead.progressStatus}</p>
        <div className="mt-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-3">
          <p className="text-[13px] font-medium text-[#A3A3A3]">추가 메모</p>
          <p className="mt-1 text-[15px] leading-[1.6] text-[#737373]">{lead.overviewSummary}</p>
        </div>
      </section>
    </div>
  );
}
