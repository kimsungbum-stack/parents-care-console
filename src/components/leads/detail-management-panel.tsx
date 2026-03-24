"use client";

import { useState } from "react";

import { FeedbackNotice } from "@/components/ui/feedback-notice";
import { isValidLeadManagementDate } from "@/lib/forms/lead-management";
import type { LeadStatus } from "@/types/domain";

type DetailManagementPanelProps = {
  leadId: string;
  initialStatus: LeadStatus;
  initialNextContactDate: string | null;
  onApply: (next: { status: LeadStatus; nextContactDate: string | null }) => void;
};

const statusOptions: LeadStatus[] = ["신규", "1차답장", "인터뷰예정", "인터뷰완료", "소개대기", "보류"];

function formatSavedAt(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;

    if (!isValidLeadManagementDate(draftNextContactDate)) {
      setFeedback({ tone: "error", message: "다음 연락일 형식을 다시 확인해 주세요." });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/leads/${leadId}/management`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: draftStatus, nextContactDate: draftNextContactDate }),
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
        status: payload.status ?? draftStatus,
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

  return (
    <section className="rounded-xl border border-[#E7E0D5] bg-white p-5">
      <div className="flex items-center justify-between gap-4 border-b border-[#E7E0D5] pb-4">
        <p className="text-[16px] font-bold text-[#292524]">운영 상태 관리</p>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={
            hasChanges && !isSaving
              ? "control-button-primary inline-flex text-[14px]"
              : "inline-flex cursor-not-allowed rounded-xl border border-[#E7E0D5] bg-[#FEFCF8] px-4 py-2 text-[14px] font-medium text-[#A8A29E]"
          }
        >
          {isSaving ? "저장 중..." : hasChanges ? "변경 저장" : "저장됨"}
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-[#292524]">상태</span>
          <select value={draftStatus} onChange={(e) => setDraftStatus(e.target.value as LeadStatus)} className="control-input">
            {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-[#292524]">다음 연락일</span>
          <input type="date" value={draftNextContactDate} onChange={(e) => setDraftNextContactDate(e.target.value)} className="control-input" />
        </label>
      </div>

      {feedback ? <div className="mt-4"><FeedbackNotice tone={feedback.tone} message={feedback.message} /></div> : null}
    </section>
  );
}
