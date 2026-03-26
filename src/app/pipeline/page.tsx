import { KanbanBoard } from "@/components/pipeline/kanban-board";
import type { LeadStatus } from "@/types/domain";

export const dynamic = "force-dynamic";

export type KanbanLead = {
  id: string;
  guardianName: string;
  careRecipientName: string | null;
  careRecipientAgeGroup: string | null;
  status: LeadStatus;
  nextContactDate: string | null;
  createdAt: string;
};

async function fetchPipelineLeads(): Promise<KanbanLead[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  const params = new URLSearchParams({
    select: "id,guardian_name,care_recipient_name,care_recipient_age_group,status,next_contact_date,created_at",
    order: "created_at.desc",
  });

  const res = await fetch(`${url}/rest/v1/leads?${params}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
  });

  if (!res.ok) return [];

  const rows = (await res.json()) as Array<{
    id: string;
    guardian_name: string;
    care_recipient_name: string | null;
    care_recipient_age_group: string | null;
    status: string;
    next_contact_date: string | null;
    created_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    guardianName: r.guardian_name,
    careRecipientName: r.care_recipient_name,
    careRecipientAgeGroup: r.care_recipient_age_group,
    status: r.status as LeadStatus,
    nextContactDate: r.next_contact_date,
    createdAt: r.created_at,
  }));
}

export default async function PipelinePage() {
  let leads: KanbanLead[] = [];
  try {
    leads = await fetchPipelineLeads();
  } catch {
    // Supabase 미연결 시 빈 보드로 표시
  }

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-[#292524]">진행 현황</h1>
        <p className="mt-1 text-[15px] text-[#78716C]">
          카드를 드래그해서 다른 단계로 이동하면 상태가 자동 저장돼요.
        </p>
      </div>
      <KanbanBoard initialLeads={leads} />
    </div>
  );
}
