"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus, Mail, Shield, X, Loader2 } from "lucide-react";

type TeamMember = {
  id: string;
  email: string | null;
  role: "admin" | "member";
  createdAt: string;
};

type Invitation = {
  id: string;
  email: string;
  role: "admin" | "member";
  status: string;
  createdAt: string;
};

const ROLE_LABELS: Record<string, string> = {
  admin: "센터장 (관리자)",
  member: "코디 (일반)",
};

export function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchTeam();
  }, []);

  async function fetchTeam() {
    try {
      const res = await fetch("/api/v1/team");
      if (!res.ok) return;
      const data = await res.json();
      setMembers(data.members ?? []);
      setInvitations(data.invitations ?? []);
    } catch {
      // silent
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setError("올바른 이메일을 입력해주세요.");
      return;
    }

    setInviting(true);
    try {
      const res = await fetch("/api/v1/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: inviteRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "초대에 실패했어요.");
        return;
      }

      setSuccess(`${email}에게 초대를 보냈어요.`);
      setInviteEmail("");
      fetchTeam();
    } catch {
      setError("초대 처리 중 문제가 발생했어요.");
    } finally {
      setInviting(false);
    }
  }

  async function handleCancelInvite(invitationId: string) {
    try {
      await fetch(`/api/v1/team?invitationId=${invitationId}`, { method: "DELETE" });
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
    } catch {
      // silent
    }
  }

  return (
    <div className="rounded-xl border border-[#E7E0D5] bg-white">
      <div className="flex items-center gap-3 border-b border-[#E7E0D5] px-5 py-4">
        <Users size={18} className="text-[#78716C]" />
        <h2 className="text-[16px] font-bold text-[#292524]">팀원 관리</h2>
      </div>

      <div className="px-5 py-5">
        {/* 현재 팀원 */}
        <div className="mb-5">
          <p className="mb-2 text-[13px] font-medium text-[#A8A29E]">팀원</p>
          <div className="space-y-2">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-[#E7E0D5] bg-[#FEFCF8] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F0E8] text-[13px] font-bold text-[#78716C]">
                    {(m.email ?? "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[#292524]">
                      {m.email || "이메일 미등록"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield size={14} className={m.role === "admin" ? "text-[#D97706]" : "text-[#A8A29E]"} />
                  <span className="text-[13px] font-medium text-[#78716C]">
                    {ROLE_LABELS[m.role] || m.role}
                  </span>
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-[14px] text-[#78716C]">아직 등록된 팀원이 없어요.</p>
            )}
          </div>
        </div>

        {/* 대기 중 초대 */}
        {invitations.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-[13px] font-medium text-[#A8A29E]">초대 대기 중</p>
            <div className="space-y-2">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-lg border border-dashed border-[#E7E0D5] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-[#A8A29E]" />
                    <div>
                      <p className="text-[14px] text-[#78716C]">{inv.email}</p>
                      <p className="text-[12px] text-[#A8A29E]">
                        {ROLE_LABELS[inv.role]} · 대기 중
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCancelInvite(inv.id)}
                    className="rounded-lg p-1 text-[#A8A29E] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                    aria-label="초대 취소"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 초대 폼 */}
        <div className="rounded-lg border border-[#E7E0D5] bg-[#FEFCF8] p-4">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus size={16} className="text-[#D97706]" />
            <p className="text-[14px] font-bold text-[#292524]">팀원 초대</p>
          </div>
          <p className="mb-3 text-[13px] text-[#78716C]">
            이메일을 입력하면 초대가 발송돼요. 초대받은 분이 로그인하면 자동으로 팀에 합류해요.
          </p>

          <form onSubmit={handleInvite} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="이메일 주소"
                className="min-w-0 flex-1 rounded-lg border border-[#E7E0D5] bg-white px-3 py-2.5 text-[14px] text-[#292524] placeholder-[#A8A29E] focus:border-[#D97706] focus:outline-none"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "admin" | "member")}
                className="rounded-lg border border-[#E7E0D5] bg-white px-3 py-2.5 text-[13px] text-[#292524] focus:border-[#D97706] focus:outline-none"
              >
                <option value="member">코디</option>
                <option value="admin">센터장</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={inviting || !inviteEmail.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D97706] px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#B45309] disabled:cursor-not-allowed disabled:bg-[#D4C5A9]"
            >
              {inviting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  초대 중...
                </>
              ) : (
                "초대 보내기"
              )}
            </button>
          </form>

          {error && (
            <p className="mt-2 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#DC2626]">
              {error}
            </p>
          )}
          {success && (
            <p className="mt-2 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-[13px] text-[#16A34A]">
              {success}
            </p>
          )}
        </div>

        {/* 권한 설명 */}
        <div className="mt-4 rounded-lg border border-[#E7E0D5] bg-[#FEFCF8] px-4 py-3">
          <p className="text-[13px] font-medium text-[#78716C]">권한 안내</p>
          <ul className="mt-1.5 space-y-1 text-[13px] text-[#A8A29E]">
            <li><span className="font-medium text-[#78716C]">센터장</span> — 모든 기능 + 설정 변경 + 팀원 관리</li>
            <li><span className="font-medium text-[#78716C]">코디</span> — 케이스 등록, 상담 기록만 가능. 요금제/설정 변경 불가.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
