import { LeadListView } from "@/components/leads/lead-list-view";
import { AppShell } from "@/components/layout/app-shell";
import { getLeadsPageData } from "@/lib/queries/get-leads";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const { leads, notice } = await getLeadsPageData();

  return (
    <AppShell
      title="케이스 목록"
      description="보호자 케이스를 검색하고 상태별로 빠르게 살펴볼 수 있어요."
    >
      <LeadListView leads={leads} notice={notice} />
    </AppShell>
  );
}
