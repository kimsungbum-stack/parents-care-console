import { LeadStatusBadge } from "@/components/leads/status-badge";
import type { LeadDetail, LeadStatus } from "@/types/domain";

type DetailHeaderProps = {
  lead: LeadDetail;
  status: LeadStatus;
  nextContactDate: string | null;
};

function getCareRecipientLabel(lead: LeadDetail) {
  const ageLabel =
    lead.careRecipientAgeGroup ??
    (lead.careRecipientAge ? `${lead.careRecipientAge}세` : null);

  return [lead.careRecipientName, ageLabel].filter(Boolean).join(" · ") || "-";
}

export function DetailHeader({ lead, status, nextContactDate }: DetailHeaderProps) {
  const detailItems = [
    { label: "연락처", value: lead.phone },
    { label: "케어 대상 정보", value: getCareRecipientLabel(lead) },
    { label: "유입경로", value: lead.source },
    { label: "다음 연락일", value: nextContactDate || "-" },
  ];

  return (
    <section className="rounded-xl border border-[#E7E0D5] bg-white p-5">
      <div className="flex flex-col gap-3 border-b border-[#E7E0D5] pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-[24px] font-bold tracking-tight text-[#292524]">{lead.guardianName}</h2>
          <p className="mt-1 max-w-2xl text-[15px] leading-[1.6] text-[#78716C]">{lead.careSummary}</p>
        </div>
        <div className="flex-shrink-0 pt-1">
          <LeadStatusBadge status={status} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {detailItems.map((item) => (
          <div key={item.label} className="rounded-lg border border-[#E7E0D5] bg-[#FEFCF8] px-4 py-3">
            <p className="text-[13px] font-medium text-[#A8A29E]">{item.label}</p>
            {item.label === "연락처" && item.value && item.value !== "-" ? (
              <a
                href={`tel:${item.value.replace(/[^0-9+]/g, "")}`}
                className="mt-1 inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#D97706] hover:text-[#B45309]"
              >
                {item.value}
                <span className="text-[12px]">전화걸기</span>
              </a>
            ) : (
              <p className="mt-1 text-[15px] font-semibold text-[#292524]">{item.value}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
