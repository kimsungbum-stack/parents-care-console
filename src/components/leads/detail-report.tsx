"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

import { EmptyPanel } from "@/components/ui/empty-panel";
import { FeedbackNotice } from "@/components/ui/feedback-notice";
import type { GuardianReportValue } from "@/lib/forms/report";
import type { LeadDetail, SummaryReportResult } from "@/types/domain";

type DetailReportProps = {
  value: GuardianReportValue;
  lead: LeadDetail;
  onSave: (value: GuardianReportValue) => Promise<{
    ok: boolean;
    value?: GuardianReportValue;
    message: string;
  }>;
};

function formatSavedAt(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function reportFieldClass() {
  return "control-input min-h-[112px] resize-y leading-[1.6]";
}

const sections: Array<{ key: keyof GuardianReportValue; label: string; placeholder: string; rows: number }> = [
  { key: "currentSituation", label: "현재 상황", placeholder: "현재 보호자와 부모님의 상황을 정리해요.", rows: 4 },
  { key: "thisWeekTasks", label: "이번 주 해야 할 일", placeholder: "이번 주에 보호자와 운영자가 확인해야 할 일을 적어요.", rows: 4 },
  { key: "hospitalSchedule", label: "병원 일정", placeholder: "예정된 외래, 검사, 재활 일정을 정리해요.", rows: 4 },
  { key: "neededHelp", label: "필요한 도움", placeholder: "현재 필요한 지원이나 연계 항목을 적어요.", rows: 4 },
  { key: "nextAction", label: "다음 액션", placeholder: "운영자가 다음에 취할 액션을 정리해요.", rows: 4 },
];

export function createInitialGuardianReportValue(lead: LeadDetail): GuardianReportValue {
  return {
    currentSituation: lead.reportRecord?.currentSituation ?? lead.parentSituationSummary,
    thisWeekTasks: lead.reportRecord?.thisWeekTasks ?? lead.overviewSummary,
    hospitalSchedule: lead.reportRecord?.hospitalSchedule ?? `최근 상담일 ${lead.latestConsultationDate}\n다음 연락일 ${lead.nextContactDate ?? "-"}`,
    neededHelp: lead.reportRecord?.neededHelp ?? lead.guardianReport,
    nextAction: lead.reportRecord?.nextAction ?? lead.progressStatus,
  };
}

function mapSummaryResultToDraft(result: SummaryReportResult): GuardianReportValue {
  return {
    currentSituation: result.overallStatus,
    thisWeekTasks: result.recommendedActions.join("\n"),
    hospitalSchedule: result.progressTimeline,
    neededHelp: result.currentNeeds.join("\n"),
    nextAction: result.recommendedActions.length > 0 ? result.recommendedActions[0] : "",
  };
}

export function DetailReport({ value, lead, onSave }: DetailReportProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMarkdown, setAiMarkdown] = useState<string | null>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleChange = (key: keyof GuardianReportValue, nextValue: string) => {
    setDraft((current) => ({ ...current, [key]: nextValue }));
    setFeedback(null);
  };

  const handleCancel = () => {
    setDraft(value);
    setIsEditing(false);
    setFeedback(null);
  };

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setFeedback(null);

    try {
      const result = await onSave(draft);
      if (!result.ok) {
        setFeedback({ tone: "error", message: result.message });
        return;
      }

      setDraft(result.value ?? draft);
      setIsEditing(false);
      setFeedback({ tone: "success", message: `${formatSavedAt(new Date())} 기준으로 리포트를 저장했어요.` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAiDraft = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setFeedback(null);
    setAiMarkdown(null);

    try {
      const response = await fetch("/api/ai/summary-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guardianName: lead.guardianName,
          careRecipientName: lead.careRecipientName,
          currentSituationSummary: lead.currentSituationSummary,
          consultations: lead.consultations.map((c) => ({
            consultedAt: c.consultedAt,
            channel: c.channel,
            summary: c.summary,
            details: c.details,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setFeedback({ tone: "error", message: data.error || "AI 초안 생성에 실패했어요." });
        return;
      }

      const result: SummaryReportResult = await response.json();
      const aiDraft = mapSummaryResultToDraft(result);
      setDraft(aiDraft);
      setAiMarkdown(result.reportMarkdown);
      setIsEditing(true);
      setFeedback({ tone: "success", message: "AI가 초안을 생성했어요. 내용을 확인하고 수정한 뒤 저장해 주세요." });
    } catch {
      setFeedback({ tone: "error", message: "AI 초안 생성 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
        <div className="flex flex-col gap-3 border-b border-[#E5E5E5] pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[16px] font-bold text-[#0A0A0A]">보호자 요약 리포트</p>
            <p className="mt-1 text-[13px] leading-[1.6] text-[#737373]">보호자에게 전달할 내용을 읽기 쉬운 문단 구조로 정리하는 영역이에요. 다음 연락 전에 보는 정리본이라고 생각하면 돼요.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleGenerateAiDraft}
                  disabled={isGenerating || lead.consultations.length === 0}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#D97706]/30 bg-[#FFFBEB] px-4 py-2.5 text-[14px] font-medium text-[#D97706] transition-colors hover:bg-[#FFEDD5] disabled:opacity-50"
                >
                  <Sparkles size={16} />
                  {isGenerating ? "생성 중..." : "AI로 초안 생성"}
                </button>
                <button type="button" onClick={() => { setDraft(value); setIsEditing(true); setFeedback(null); setAiMarkdown(null); }} className="control-button-primary inline-flex">리포트 편집</button>
              </>
            ) : (
              <>
                <button type="button" onClick={handleSave} disabled={isSaving} className="control-button-primary inline-flex">{isSaving ? "저장 중..." : "리포트 저장"}</button>
                <button type="button" onClick={handleCancel} disabled={isSaving} className="control-button-secondary inline-flex">취소</button>
              </>
            )}
          </div>
        </div>

        {feedback ? <div className="mt-4"><FeedbackNotice tone={feedback.tone} message={feedback.message} /></div> : null}

        {!isEditing ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {sections.map((section) => value[section.key] ? (
              <article key={section.key} className="rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] px-5 py-4">
                <p className="text-[13px] font-medium text-[#A3A3A3]">{section.label}</p>
                <p className="mt-2 whitespace-pre-line text-[15px] leading-[1.6] text-[#0A0A0A]">{value[section.key]}</p>
              </article>
            ) : (
              <EmptyPanel key={section.key} title={`${section.label} 내용이 아직 없어요.`} description="편집 모드에서 내용을 입력하면 이 영역에 바로 반영돼요." compact />
            ))}
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {sections.map((section) => (
              <label key={section.key} className="block">
                <span className="mb-2 block text-[13px] font-medium text-[#0A0A0A]">{section.label}</span>
                <textarea value={draft[section.key]} onChange={(event) => handleChange(section.key, event.target.value)} placeholder={section.placeholder} rows={section.rows} className={reportFieldClass()} />
              </label>
            ))}
          </div>
        )}
      </div>

      {aiMarkdown && (
        <div className="rounded-xl border border-[#D97706]/20 bg-[#FFFBEB] p-5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#D97706]" />
            <p className="text-[14px] font-bold text-[#0A0A0A]">AI 생성 리포트 (보호자 공유용)</p>
          </div>
          <div className="mt-3 rounded-lg border border-[#E5E5E5] bg-white p-4">
            <div className="prose-warm whitespace-pre-line text-[15px] leading-[1.8] text-[#0A0A0A]">
              {aiMarkdown}
            </div>
          </div>
          <p className="mt-2 text-[13px] text-[#737373]">위 내용을 복사하여 보호자에게 전달할 수 있어요.</p>
        </div>
      )}
    </section>
  );
}
