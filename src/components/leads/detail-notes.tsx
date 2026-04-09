"use client";

import { useEffect, useState } from "react";

import { EmptyPanel } from "@/components/ui/empty-panel";
import { FeedbackNotice } from "@/components/ui/feedback-notice";
import {
  initialLeadNoteValue,
  noteTypeOptions,
  type LeadNoteErrors,
  type LeadNoteInputValue,
} from "@/lib/forms/note";
import type { LeadNote } from "@/types/domain";

type DetailNotesProps = {
  notes: LeadNote[];
  onCreateNote: (value: LeadNoteInputValue) => Promise<{
    ok: boolean;
    note?: LeadNote;
    message: string;
    fieldErrors?: LeadNoteErrors;
  }>;
};

export function DetailNotes({ notes, onCreateNote }: DetailNotesProps) {
  const [draft, setDraft] = useState<LeadNoteInputValue>(initialLeadNoteValue);
  const [fieldErrors, setFieldErrors] = useState<LeadNoteErrors>({});
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFieldErrors({});
  }, [notes]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setFeedback(null);
    setFieldErrors({});

    try {
      const result = await onCreateNote(draft);
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setFeedback({ tone: "error", message: result.message });
        return;
      }

      setDraft(initialLeadNoteValue);
      setFeedback({ tone: "success", message: result.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-[#E5E5E5] bg-white p-5">
        <div className="border-b border-[#E5E5E5] pb-4">
          <p className="text-[16px] font-bold text-[#0A0A0A]">새 메모 추가</p>
          <p className="mt-1 text-[13px] leading-[1.6] text-[#737373]">운영자가 기억해야 할 내용만 간단히 남기면 돼요. 파트너와 공유할 내용도 여기서 바로 분리해요.</p>
        </div>

        {feedback ? <div className="mt-4"><FeedbackNotice tone={feedback.tone} message={feedback.message} /></div> : null}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-[#0A0A0A]">메모 유형</span>
            <select value={draft.noteType} onChange={(event) => {
              setDraft((current) => ({ ...current, noteType: event.target.value as LeadNoteInputValue["noteType"] }));
              setFeedback(null);
              setFieldErrors((current) => ({ ...current, noteType: undefined }));
            }} className="control-input">
              {noteTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            {fieldErrors.noteType ? <p className="mt-1.5 text-[13px] text-[#DC2626]">{fieldErrors.noteType}</p> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-[#0A0A0A]">메모 내용</span>
            <textarea value={draft.content} onChange={(event) => {
              setDraft((current) => ({ ...current, content: event.target.value }));
              setFeedback(null);
              setFieldErrors((current) => ({ ...current, content: undefined }));
            }} rows={4} placeholder="운영자가 기억해야 할 포인트나 파트너 공유 사항을 적어요." className="control-input min-h-[112px] resize-y leading-[1.6]" />
            {fieldErrors.content ? <p className="mt-1.5 text-[13px] text-[#DC2626]">{fieldErrors.content}</p> : null}
          </label>

          <button type="submit" disabled={isSaving} className="control-button-primary inline-flex">
            {isSaving ? "저장 중..." : "메모 저장"}
          </button>
        </form>
      </section>

      {notes.length > 0 ? notes.map((note) => (
        <article key={note.id} className="rounded-xl border border-[#E5E5E5] bg-white p-5">
          <div className="flex items-center justify-between gap-4 border-b border-[#E5E5E5] pb-3">
            <p className="text-[15px] font-semibold text-[#0A0A0A]">{note.type}</p>
            <p className="text-[13px] text-[#A3A3A3]">{note.createdAt}</p>
          </div>
          <p className="mt-3 text-[15px] leading-[1.6] text-[#737373]">{note.content}</p>
        </article>
      )) : (
        <EmptyPanel title="아직 저장된 메모가 없어요." description="첫 운영 메모 또는 파트너 메모를 추가하면 이 영역에 바로 표시돼요." compact />
      )}
    </div>
  );
}
