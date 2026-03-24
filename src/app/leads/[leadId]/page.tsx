import { DetailErrorState } from "@/components/leads/detail-error-state";
import { DetailNotFound } from "@/components/leads/detail-not-found";
import { DetailWorkspace } from "@/components/leads/detail-workspace";
import { AppShell } from "@/components/layout/app-shell";
import { getLeadDetailPageData } from "@/lib/queries/get-lead-detail";

export const dynamic = "force-dynamic";

type LeadDetailPageProps = {
  params: Promise<{
    leadId: string;
  }>;
};

export default async function LeadDetailPage({
  params,
}: LeadDetailPageProps) {
  const { leadId } = await params;
  const result = await getLeadDetailPageData(leadId);

  if (result.status === "not_found") {
    return (
      <AppShell
        currentPath="/leads"
        title="리드 상세"
        description="선택한 보호자의 기본 정보와 운영 기록을 확인하는 상세 화면입니다."
      >
        <DetailNotFound />
      </AppShell>
    );
  }

  if (result.status === "error") {
    return (
      <AppShell
        currentPath="/leads"
        title="리드 상세"
        description="선택한 보호자의 기본 정보와 운영 기록을 확인하는 상세 화면입니다."
      >
        <DetailErrorState message={result.message} />
      </AppShell>
    );
  }

  return (
    <AppShell
      currentPath="/leads"
      title={`리드 상세: ${result.lead.guardianName}`}
      description="상담 기록, 보호자 요약 리포트, 운영 메모를 한 화면에서 이어서 관리할 수 있습니다."
    >
      <DetailWorkspace lead={result.lead} />
    </AppShell>
  );
}
