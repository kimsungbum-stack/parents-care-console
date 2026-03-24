import { NewLeadForm } from "@/components/leads/new-lead-form";
import { AppShell } from "@/components/layout/app-shell";

export default function NewLeadPage() {
  return (
    <AppShell
      currentPath="/leads/new"
      title="신규 리드 등록"
      description="필수 정보를 먼저 등록하고, 생성된 상세 화면에서 후속 관리까지 이어가는 운영 화면입니다."
    >
      <NewLeadForm />
    </AppShell>
  );
}
