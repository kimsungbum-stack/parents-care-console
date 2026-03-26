"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Building2, User, Download, LogOut, Save, Check, Trash2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { TeamManagement } from "@/components/settings/team-management";

export default function SettingsPage() {
  const router = useRouter();
  const [plan, setPlan] = useState("무료");

  // 기관명
  const [orgName, setOrgName] = useState("");
  const [orgNameDraft, setOrgNameDraft] = useState("");
  const [orgSaving, setOrgSaving] = useState(false);
  const [orgSaved, setOrgSaved] = useState(false);

  // 프로필
  const [userName, setUserName] = useState("");
  const [userNameDraft, setUserNameDraft] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userPhoneDraft, setUserPhoneDraft] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // 내보내기
  const [exportStatus, setExportStatus] = useState<"idle" | "loading" | "error">("idle");
  const [exportError, setExportError] = useState("");

  // 데이터 삭제
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteAllStatus, setDeleteAllStatus] = useState<"idle" | "loading" | "error">("idle");
  const [deleteAllError, setDeleteAllError] = useState("");

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
          if (data.orgName) {
            setOrgName(data.orgName);
            setOrgNameDraft(data.orgName);
          }
        }
      } catch {
        // API unavailable
      }

      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        const name = data.user?.user_metadata?.full_name ?? "";
        const phone = data.user?.user_metadata?.phone ?? "";
        setUserName(name);
        setUserNameDraft(name);
        setUserPhone(phone);
        setUserPhoneDraft(phone);
        setUserEmail(data.user?.email ?? null);
      } catch {
        // auth unavailable
      }
    }
    fetchData();
  }, []);

  async function handleSaveOrgName() {
    if (orgNameDraft.trim() === orgName) return;
    setOrgSaving(true);
    setOrgSaved(false);
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName: orgNameDraft }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrgName(data.orgName);
        setOrgSaved(true);
        setTimeout(() => setOrgSaved(false), 2000);
      }
    } catch {
      // save failed
    } finally {
      setOrgSaving(false);
    }
  }

  async function handleSaveProfile() {
    if (userNameDraft.trim() === userName && userPhoneDraft.trim() === userPhone) return;
    setProfileSaving(true);
    setProfileSaved(false);
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: userNameDraft, userPhone: userPhoneDraft }),
      });
      if (res.ok) {
        setUserName(userNameDraft.trim());
        setUserPhone(userPhoneDraft.trim());
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2000);
      }
    } catch {
      // save failed
    } finally {
      setProfileSaving(false);
    }
  }

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

  async function handleDeleteAll() {
    if (deleteConfirmText !== "삭제") return;
    setDeleteAllStatus("loading");
    setDeleteAllError("");
    try {
      const res = await fetch("/api/leads", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setDeleteAllError(data.message || "삭제에 실패했어요.");
        setDeleteAllStatus("error");
        return;
      }
      setDeleteAllStatus("idle");
      setShowDeleteAll(false);
      setDeleteConfirmText("");
      router.refresh();
    } catch {
      setDeleteAllError("삭제 중 문제가 발생했어요.");
      setDeleteAllStatus("error");
    }
  }

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const orgNameChanged = orgNameDraft.trim() !== orgName;
  const profileChanged = userNameDraft.trim() !== userName || userPhoneDraft.trim() !== userPhone;

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8" style={{ backgroundColor: "#FEFCF8" }}>
      <div className="mb-6">
        <h1 className="text-[24px] font-bold tracking-tight text-[#292524]">설정</h1>
        <p className="mt-1 text-[15px] text-[#78716C]">센터 운영 설정을 관리하세요.</p>
      </div>

      {/* 현재 요금제 */}
      <div className="mb-5 rounded-[8px] border border-[#E7E0D5] bg-white">
        <div className="flex items-center gap-3 border-b border-[#E7E0D5] px-5 py-4">
          <CreditCard size={18} className="text-[#78716C]" />
          <h2 className="text-[16px] font-bold text-[#292524]">현재 요금제</h2>
        </div>
        <div className="px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13px] text-[#78716C]">현재 요금제</p>
              <p className="mt-1 text-[18px] font-bold text-[#292524]">{plan}</p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-[8px] bg-[#D97706] px-5 text-[14px] font-bold text-white transition-colors hover:bg-[#B45309]"
              style={{ minHeight: 44 }}
            >
              요금제 변경하기
            </Link>
          </div>
        </div>
      </div>

      {/* 기관명 변경 */}
      <div className="mb-5 rounded-[8px] border border-[#E7E0D5] bg-white">
        <div className="flex items-center gap-3 border-b border-[#E7E0D5] px-5 py-4">
          <Building2 size={18} className="text-[#78716C]" />
          <h2 className="text-[16px] font-bold text-[#292524]">기관명</h2>
        </div>
        <div className="px-5 py-5">
          <label className="block text-[13px] font-medium text-[#78716C]" htmlFor="org-name">
            센터명
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              id="org-name"
              type="text"
              value={orgNameDraft}
              onChange={(e) => setOrgNameDraft(e.target.value)}
              placeholder="센터명을 입력하세요"
              className="flex-1 rounded-[8px] border border-[#E7E0D5] bg-[#FEFCF8] px-4 text-[15px] text-[#292524] placeholder-[#A8A29E] outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
              style={{ minHeight: 44 }}
            />
            <button
              type="button"
              onClick={handleSaveOrgName}
              disabled={!orgNameChanged || orgSaving}
              className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#D97706] px-5 text-[14px] font-bold text-white transition-colors hover:bg-[#B45309] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ minHeight: 44 }}
            >
              {orgSaved ? (
                <>
                  <Check size={16} />
                  저장 완료
                </>
              ) : (
                <>
                  <Save size={16} />
                  {orgSaving ? "저장 중..." : "저장"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 내 프로필 */}
      <div className="mb-5 rounded-[8px] border border-[#E7E0D5] bg-white">
        <div className="flex items-center gap-3 border-b border-[#E7E0D5] px-5 py-4">
          <User size={18} className="text-[#78716C]" />
          <h2 className="text-[16px] font-bold text-[#292524]">내 프로필</h2>
        </div>
        <div className="px-5 py-5">
          {userEmail && (
            <div className="mb-4 rounded-[8px] border border-[#E7E0D5] bg-[#FEFCF8] px-4 py-3">
              <p className="text-[13px] font-medium text-[#A8A29E]">이메일</p>
              <p className="mt-1 text-[15px] text-[#292524]">{userEmail}</p>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[13px] font-medium text-[#78716C]" htmlFor="user-name">
                이름
              </label>
              <input
                id="user-name"
                type="text"
                value={userNameDraft}
                onChange={(e) => setUserNameDraft(e.target.value)}
                placeholder="이름을 입력하세요"
                className="mt-2 w-full rounded-[8px] border border-[#E7E0D5] bg-[#FEFCF8] px-4 text-[15px] text-[#292524] placeholder-[#A8A29E] outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                style={{ minHeight: 44 }}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#78716C]" htmlFor="user-phone">
                전화번호
              </label>
              <input
                id="user-phone"
                type="tel"
                value={userPhoneDraft}
                onChange={(e) => setUserPhoneDraft(e.target.value)}
                placeholder="010-0000-0000"
                className="mt-2 w-full rounded-[8px] border border-[#E7E0D5] bg-[#FEFCF8] px-4 text-[15px] text-[#292524] placeholder-[#A8A29E] outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                style={{ minHeight: 44 }}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={!profileChanged || profileSaving}
              className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#D97706] px-5 text-[14px] font-bold text-white transition-colors hover:bg-[#B45309] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ minHeight: 44 }}
            >
              {profileSaved ? (
                <>
                  <Check size={16} />
                  저장 완료
                </>
              ) : (
                <>
                  <Save size={16} />
                  {profileSaving ? "저장 중..." : "프로필 저장"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 팀원 관리 */}
      <div className="mb-5">
        <TeamManagement />
      </div>

      {/* 데이터 내보내기 */}
      <div className="mb-5 rounded-[8px] border border-[#E7E0D5] bg-white">
        <div className="flex items-center gap-3 border-b border-[#E7E0D5] px-5 py-4">
          <Download size={18} className="text-[#78716C]" />
          <h2 className="text-[16px] font-bold text-[#292524]">데이터 내보내기</h2>
        </div>
        <div className="px-5 py-5">
          <p className="text-[14px] text-[#78716C]">
            케이스 데이터를 CSV 파일로 내려받을 수 있어요. 스탠다드 이상 요금제에서 이용 가능해요.
          </p>
          {exportStatus === "error" && (
            <p className="mt-2 rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#DC2626]">
              {exportError}
            </p>
          )}
          <button
            type="button"
            onClick={handleExport}
            disabled={exportStatus === "loading"}
            className="mt-3 inline-flex items-center gap-2 rounded-[8px] border border-[#E7E0D5] bg-[#FEFCF8] px-4 text-[14px] font-medium text-[#292524] transition-colors hover:bg-[#F5EFE6] disabled:opacity-50"
            style={{ minHeight: 44 }}
          >
            <Download size={16} />
            {exportStatus === "loading" ? "다운로드 중..." : "CSV 내보내기"}
          </button>
        </div>
      </div>

      {/* 데이터 관리 */}
      <div className="mb-5 rounded-[8px] border border-[#E7E0D5] bg-white">
        <div className="flex items-center gap-3 border-b border-[#E7E0D5] px-5 py-4">
          <Trash2 size={18} className="text-[#DC2626]" />
          <h2 className="text-[16px] font-bold text-[#292524]">데이터 관리</h2>
        </div>
        <div className="px-5 py-5">
          <p className="text-[14px] text-[#78716C]">
            등록된 모든 케이스를 삭제할 수 있어요. 삭제된 데이터는 복구할 수 없습니다.
          </p>
          {deleteAllStatus === "error" && (
            <p className="mt-2 rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#DC2626]">
              {deleteAllError}
            </p>
          )}
          {!showDeleteAll ? (
            <button
              type="button"
              onClick={() => setShowDeleteAll(true)}
              className="mt-3 inline-flex items-center gap-2 rounded-[8px] border border-[#FCA5A5] bg-white px-4 text-[14px] font-medium text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
              style={{ minHeight: 44 }}
            >
              <Trash2 size={16} />
              모든 케이스 삭제
            </button>
          ) : (
            <div className="mt-3 rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] p-4">
              <p className="text-[15px] font-bold text-[#991B1B]">
                정말 모든 케이스를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
              <p className="mt-2 text-[13px] text-[#DC2626]">
                확인하려면 아래에 <span className="font-bold">삭제</span>를 입력하세요.
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="삭제"
                className="mt-2 w-full rounded-[8px] border border-[#FCA5A5] bg-white px-3 py-2 text-[14px] text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 sm:w-48"
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleDeleteAll}
                  disabled={deleteConfirmText !== "삭제" || deleteAllStatus === "loading"}
                  className="rounded-[8px] bg-[#DC2626] px-4 text-[14px] font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-50"
                  style={{ minHeight: 44 }}
                >
                  {deleteAllStatus === "loading" ? "삭제 중..." : "모든 케이스 삭제"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteAll(false);
                    setDeleteConfirmText("");
                    setDeleteAllError("");
                    setDeleteAllStatus("idle");
                  }}
                  disabled={deleteAllStatus === "loading"}
                  className="rounded-[8px] border border-[#E7E0D5] bg-white px-4 text-[14px] font-medium text-[#78716C] transition-colors hover:bg-[#FEFCF8]"
                  style={{ minHeight: 44 }}
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 로그아웃 */}
      <div className="rounded-[8px] border border-[#E7E0D5] bg-white">
        <div className="px-5 py-5">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-[8px] border border-[#FCA5A5] bg-white px-4 text-[14px] font-medium text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
            style={{ minHeight: 44 }}
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
