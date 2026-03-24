"use client";

import { useEffect, useState } from "react";

import { EmptyPanel } from "@/components/ui/empty-panel";
import { FeedbackNotice } from "@/components/ui/feedback-notice";
import {
  consultationChannelOptions,
  initialLeadConsultationValue,
  type LeadConsultationErrors,
  type LeadConsultationInputValue,
} from "@/lib/forms/consultation";
import type { LeadConsultation } from "@/types/domain";

type DetailConsultationsProps = {
  consultations: LeadConsultation[];
  onCreateConsultation: (value: LeadConsultationInputValue) => Promise<{
    ok: boolean;
    consultation?: LeadConsultation;
    message: string;
    fieldErrors?: LeadConsultationErrors;
  }>;
};

export function DetailConsultations({ consultations, onCreateConsultation }: DetailConsultationsProps) {
  const [draft, setDraft] = useState<LeadConsultationInputValue>(initialLeadConsultationValue);
  const [fieldErrors, setFieldErrors] = useState<LeadConsultationErrors>({});
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFieldErrors({});
  }, [consultations]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setFeedback(null);
    setFieldErrors({});

    try {
      const result = await onCreateConsultation(draft);
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setFeedback({ tone: "error", message: result.message });
        return;
      }

      setDraft(initialLeadConsultationValue);
      setFeedback({ tone: "success", message: result.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-[#E7E0D5] bg-white p-5">
        <div className="border-b border-[#E7E0D5] pb-4">
          <p className="text-[16px] font-bold text-[#292524]">새 상담 기록 추가</p>
          <p className="mt-1 text-[13px] leading-[1.6] text-[#78716C]">후속 통화가 끝나면 여기만 바로 채우면 돼요. 저장하면 아래 목록 상단에 즉시 반영돼요.</p>
        </div>

        {feedback ? <div className="mt-4"><FeedbackNotice tone={feedback.tone} message={feedback.message} /></div> : null}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-[#292524]">상담일시</span>
              <input type="datetime-local" value={draft.consultedAt} onChange={(event) => {
                setDraft((current) => ({ ...current, consultedAt: event.target.value }));
                setFeedback(null);
                setFieldErrors((current) => ({ ...current, consultedAt: undefined }));
              }} className="control-input" />
              {fieldErrors.consultedAt ? <p className="mt-1.5 text-[13px] text-[#DC2626]">{fieldErrors.consultedAt}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-[#292524]">상담 채널</span>
              <select value={draft.channel} onChange={(event) => {
                setDraft((current) => ({ ...current, channel: event.target.value }));
                setFeedback(null);
                setFieldErrors((current) => ({ ...current, channel: undefined }));
              }} className="control-input">
                {consultationChannelOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              {fieldErrors.channel ? <p className="mt-1.5 text-[13px] text-[#DC2626]">{fieldErrors.channel}</p> : null}
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-[#292524]">상담 요약</span>
            <input type="text" value={draft.summary} onChange={(event) => {
              setDraft((current) => ({ ...current, summary: event.target.value }));
              setFeedback(null);
              setFieldErrors((current) => ({ ...current, summary: undefined }));
            }} placeholder="예: 초기 상담 진행, 병원동행 범위 확인" className="control-input" />
            {fieldErrors.summary ? <p className="mt-1.5 text-[13px] text-[#DC2626]">{fieldErrors.summary}</p> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-[#292524]">상세 메모</span>
            <textarea value={draft.details} onChange={(event) => {
              setDraft((current) => ({ ...current, details: event.target.value }));
              setFeedback(null);
            }} rows={4} placeholder="상담 중 확인한 배경, 보호자 요청사항, 후속 확인 포인트를 적어요." className="control-input min-h-[112px] resize-y leading-[1.6]" />
          </label>

          <button type="submit" disabled={isSaving} className="control-button-primary inline-flex">
            {isSaving ? "저장 중..." : "상담 기록 저장"}
          </button>
        </form>
      </section>

      {consultations.length > 0 ? consultations.map((consultation) => (
        <article key={consultation.id} className="rounded-xl border border-[#E7E0D5] bg-white p-5">
          <div className="flex flex-col gap-2 border-b border-[#E7E0D5] pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[15px] font-semibold text-[#292524]">{consultation.consultedAt}</p>
              <p className="mt-0.5 text-[13px] text-[#A8A29E]">{consultation.channel}</p>
            </div>
            <p className="text-[15px] font-medium text-[#292524]">{consultation.summary}</p>
          </div>
          <p className="mt-3 text-[15px] leading-[1.6] text-[#78716C]">{consultation.details || "-"}</p>
        </article>
      )) : (
        <EmptyPanel title="아직 저장된 상담 기록이 없어요." description="첫 상담 기록을 추가하면 이 영역에 최신 순으로 바로 표시돼요." compact />
      )}
    </div>
  );
}
