import { NewLeadForm } from "@/components/leads/new-lead-form";
import { AppShell } from "@/components/layout/app-shell";

export default function NewLeadPage() {
  return (
    <AppShell
      title="신규 케이스 등록"
      description="보호자 이름과 연락처만 입력하면 바로 시작할 수 있어요."
    >
      <NewLeadForm />
    </AppShell>
  );
}
