"use client";

import { useState } from "react";

import { FeedbackNotice } from "@/components/ui/feedback-notice";
import { isValidLeadManagementDate } from "@/lib/forms/lead-management";
import { getStatusLabel, type LeadStatus } from "@/types/domain";

type DetailManagementPanelProps = {
  leadId: string;
  initialStatus: LeadStatus;
  initialNextContactDate: string | null;
  onApply: (next: { status: LeadStatus; nextContactDate: string | null }) => void;
};

const statusOptions: LeadStatus[] = ["신규", "1차답장", "인터뷰예정", "인터뷰완료", "소개대기", "보류"];

const quickDates = [
  { label: "오늘", days: 0 },
  { label: "내일", days: 1 },
  { label: "3일 후", days: 3 },
  { label: "1주일 후", days: 7 },
];

function formatSavedAt(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DetailManagementPanel({
  leadId,
  initialStatus,
  initialNextContactDate,
  onApply,
}: DetailManagementPanelProps) {
  const [savedStatus, setSavedStatus] = useState(initialStatus);
  const [savedNextContactDate, setSavedNextContactDate] = useState(initialNextContactDate ?? "");
  const [draftStatus, setDraftStatus] = useState(initialStatus);
  const [draftNextContactDate, setDraftNextContactDate] = useState(initialNextContactDate ?? "");
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = draftStatus !== savedStatus || draftNextContactDate !== savedNextContactDate;

  const saveValues = async (status: LeadStatus, nextContactDate: string) => {
    setIsSaving(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/leads/${leadId}/management`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, nextContactDate }),
      });

      const payload = (await response.json()) as {
        status?: LeadStatus;
        nextContactDate?: string | null;
        message?: string;
      };

      if (!response.ok) {
        setFeedback({ tone: "error", message: payload.message ?? "상태 변경 내용을 저장하지 못했어요. 다시 확인해 주세요." });
        return;
      }

      const nextState = {
        status: payload.status ?? status,
        nextContactDate: payload.nextContactDate ?? null,
      };

      setSavedStatus(nextState.status);
      setSavedNextContactDate(nextState.nextContactDate ?? "");
      setDraftStatus(nextState.status);
      setDraftNextContactDate(nextState.nextContactDate ?? "");
      onApply(nextState);
      setFeedback({ tone: "success", message: `${formatSavedAt(new Date())} 저장 완료.` });
    } catch {
      setFeedback({ tone: "error", message: "저장 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;

    if (!isValidLeadManagementDate(draftNextContactDate)) {
      setFeedback({ tone: "error", message: "다음 연락일 형식을 다시 확인해 주세요." });
      return;
    }

    await saveValues(draftStatus, draftNextContactDate);
  };

  const handleQuickDate = async (days: number) => {
    if (isSaving) return;
    const date = addDays(days);
    setDraftNextContactDate(date);
    await saveValues(draftStatus, date);
  };

  return (
    <section className="rounded-xl border border-[#E5E5E5] bg-white p-5">
      <div className="flex items-center justify-between gap-4 border-b border-[#E5E5E5] pb-4">
        <p className="text-[16px] font-bold text-[#0A0A0A]">운영 상태 관리</p>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={
            hasChanges && !isSaving
              ? "control-button-primary inline-flex min-h-[44px] items-center text-[14px]"
              : "inline-flex min-h-[44px] cursor-not-allowed items-center rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-2 text-[14px] font-medium text-[#A3A3A3]"
          }
        >
          {isSaving ? "저장 중..." : hasChanges ? "변경 저장" : "저장됨"}
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[14px] font-medium text-[#0A0A0A]">상태</span>
          <select
            value={draftStatus}
            onChange={(e) => setDraftStatus(e.target.value as LeadStatus)}
            className="control-input min-h-[44px]"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>{getStatusLabel(option)}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-[14px] font-medium text-[#0A0A0A]">다음 연락일</span>
          <input
            type="date"
            value={draftNextContactDate}
            onChange={(e) => setDraftNextContactDate(e.target.value)}
            className="control-input min-h-[44px]"
          />
          {/* 빠른 날짜 선택 — 1클릭 저장 */}
          <div className="mt-2 flex flex-wrap gap-2">
            {quickDates.map(({ label, days }) => (
              <button
                key={days}
                type="button"
                onClick={() => handleQuickDate(days)}
                disabled={isSaving}
                className="rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-1.5 text-[13px] font-medium text-[#737373] transition-colors hover:border-[#D97706] hover:bg-[#FFEDD5] hover:text-[#D97706] disabled:opacity-50"
              >
                {label}
              </button>
            ))}
          </div>
        </label>
      </div>

      {feedback ? <div className="mt-4"><FeedbackNotice tone={feedback.tone} message={feedback.message} /></div> : null}
    </section>
  );
}
