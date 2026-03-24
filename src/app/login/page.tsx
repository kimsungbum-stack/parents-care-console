import { AppShell } from "@/components/layout/app-shell";

export default function LoginPage() {
  return (
    <AppShell
      currentPath="/login"
      title="로그인"
      description="운영자 로그인 화면이 들어갈 자리예요. 현재는 데모용 기본 라우트만 유지하고 있어요."
    >
      <div className="max-w-md rounded-xl border border-[#E7E0D5] bg-white p-6">
        <p className="text-[15px] text-[#78716C]">
          운영자 인증 연결은 다음 단계에서 이어서 진행할 수 있어요.
        </p>
      </div>
    </AppShell>
  );
}
