"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Building2, Download, LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { TeamManagement } from "@/components/settings/team-management";

export default function SettingsPage() {
  const router = useRouter();
  const [plan, setPlan] = useState("무료");
  const [orgName, setOrgName] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<"idle" | "loading" | "error">("idle");
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/v1/usage");
        if (res.ok) {
          const data = await res.json();
          const planMap: Record<string, string> = {
            free: "무료",
            standard: "스탠다드",
            premium: "프리미엄",
          };
          setPlan(planMap[data.plan] ?? "무료");
          if (data.orgName) setOrgName(data.orgName);
        }
      } catch {
        // API unavailable
      }

      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        setUserName(data.user?.user_metadata?.full_name ?? null);
        setUserEmail(data.user?.email ?? null);
      } catch {
        // auth unavailable
      }
    }
    fetchData();
  }, []);

  async function handleExport() {
    setExportStatus("loading");
    setExportError("");
    try {
      const res = await fetch("/api/v1/export");
      if (!res.ok) {
        const data = await res.json();
        setExportError(data.error || data.message || "내보내기에 실패했어요.");
        setExportStatus("error");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "leads_export.csv";
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus("idle");
    } catch {
      setExportError("내보내기 중 문제가 발생했어요.");
      setExportStatus("error");
    }
  }

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-bold tracking-tight text-[#292524]">설정</h1>
        <p className="mt-1 text-[15px] text-[#78716C]">센터 운영 설정을 관리하세요.</p>
      </div>

      {/* 요금제 */}
      <div className="mb-5 rounded-xl border border-[#E7E0D5] bg-white">
        <div className="flex items-center gap-3 border-b border-[#E7E0D5] px-5 py-4">
          <CreditCard size={18} className="text-[#78716C]" />
          <h2 className="text-[16px] font-bold text-[#292524]">요금제</h2>
        </div>
        <div className="px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13px] text-[#78716C]">현재 요금제</p>
              <p className="mt-1 text-[18px] font-bold text-[#292524]">{plan}</p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl bg-[#D97706] px-5 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#B45309]"
            >
              요금제 변경하기
            </Link>
          </div>
        </div>
      </div>

      {/* 센터 정보 */}
      <div className="mb-5 rounded-xl border border-[#E7E0D5] bg-white">
        <div className="flex items-center gap-3 border-b border-[#E7E0D5] px-5 py-4">
          <Building2 size={18} className="text-[#78716C]" />
          <h2 className="text-[16px] font-bold text-[#292524]">센터 정보</h2>
        </div>
        <div className="px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-[#E7E0D5] bg-[#FEFCF8] px-4 py-3">
              <p className="text-[13px] font-medium text-[#A8A29E]">센터명</p>
              <p className="mt-1 text-[15px] font-semibold text-[#292524]">{orgName || "미등록"}</p>
            </div>
            <div className="rounded-lg border border-[#E7E0D5] bg-[#FEFCF8] px-4 py-3">
              <p className="text-[13px] font-medium text-[#A8A29E]">담당자</p>
              <p className="mt-1 text-[15px] font-semibold text-[#292524]">{userName || "미등록"}</p>
              {userEmail && <p className="mt-0.5 text-[13px] text-[#78716C]">{userEmail}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* 팀원 관리 */}
      <div className="mb-5">
        <TeamManagement />
      </div>

      {/* 데이터 내보내기 */}
      <div className="mb-5 rounded-xl border border-[#E7E0D5] bg-white">
        <div className="flex items-center gap-3 border-b border-[#E7E0D5] px-5 py-4">
          <Download size={18} className="text-[#78716C]" />
          <h2 className="text-[16px] font-bold text-[#292524]">데이터 내보내기</h2>
        </div>
        <div className="px-5 py-5">
          <p className="text-[14px] text-[#78716C]">
            케이스 데이터를 CSV 파일로 내려받을 수 있어요. 스탠다드 이상 요금제에서 이용 가능해요.
          </p>
          {exportStatus === "error" && (
            <p className="mt-2 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#DC2626]">
              {exportError}
            </p>
          )}
          <button
            type="button"
            onClick={handleExport}
            disabled={exportStatus === "loading"}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#E7E0D5] bg-[#FEFCF8] px-4 py-2.5 text-[14px] font-medium text-[#292524] transition-colors hover:bg-[#F5EFE6] disabled:opacity-50"
          >
            <Download size={16} />
            {exportStatus === "loading" ? "다운로드 중..." : "CSV 내보내기"}
          </button>
        </div>
      </div>

      {/* 로그아웃 */}
      <div className="rounded-xl border border-[#E7E0D5] bg-white">
        <div className="px-5 py-5">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-[#FCA5A5] bg-white px-4 py-2.5 text-[14px] font-medium text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
