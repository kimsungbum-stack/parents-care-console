"use client";

import { useState } from "react";
import { Sparkles, Lock } from "lucide-react";

import type { ConsultationAnalysis, PlanTier, PLAN_FEATURES } from "@/types/domain";

type AiAnalysisCardProps = {
  leadId: string;
  latestConsultationDetails?: string;
  planTier?: PlanTier;
};

const urgencyStyles: Record<ConsultationAnalysis["urgencyLevel"], string> = {
  높음: "border-[#DC2626]/20 bg-[#FEF2F2] text-[#DC2626]",
  보통: "border-[#D97706]/20 bg-[#FFFBEB] text-[#D97706]",
  낮음: "border-[#16A34A]/20 bg-[#F0FDF4] text-[#16A34A]",
};

function hasAiAccess(planTier?: PlanTier): boolean {
  if (!planTier) return true;
  return planTier === "premium";
}

export function AiAnalysisCard({ leadId, latestConsultationDetails, planTier }: AiAnalysisCardProps) {
  const [result, setResult] = useState<ConsultationAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  void leadId;

  const canUseAi = hasAiAccess(planTier);

  const handleAnalyze = async () => {
    if (!latestConsultationDetails || !canUseAi) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/analyze-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultationText: latestConsultationDetails }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "분석 요청에 실패했어요.");
      }

      const data: ConsultationAnalysis = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!canUseAi) {
    return (
      <div className="rounded-xl border border-dashed border-[#E5E5E5] bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F5] text-[#A3A3A3]">
            <Lock size={14} />
          </div>
          <p className="text-[13px] font-medium text-[#737373]">AI 상담 분석</p>
        </div>
        <p className="mt-2 text-[15px] leading-[1.6] text-[#737373]">
          이 기능은 프리미엄 요금제에서 사용할 수 있어요.
        </p>
        <p className="mt-1 text-[13px] text-[#A3A3A3]">
          AI가 상담 내용을 자동으로 분석하여 보호자 정보, 상황 요약, 핵심 이슈를 추출해요.
        </p>
      </div>
    );
  }

  if (!latestConsultationDetails) {
    return (
      <div className="rounded-xl border border-dashed border-[#E5E5E5] bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#FFEDD5] text-[#D97706]">
            <Sparkles size={14} />
          </div>
          <p className="text-[13px] font-medium text-[#737373]">AI 상담 분석</p>
        </div>
        <p className="mt-2 text-[13px] text-[#A3A3A3]">상담 기록이 있으면 AI가 자동으로 분석할 수 있어요.</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#FFEDD5] text-[#D97706]">
            <Sparkles size={14} />
          </div>
          <p className="text-[13px] font-medium text-[#737373]">AI 상담 분석</p>
        </div>
        <p className="mt-2 text-[13px] leading-[1.6] text-[#737373]">최근 상담 내용을 AI가 분석하여 보호자 정보, 상황 요약, 핵심 이슈를 추출해요.</p>
        {error && (
          <p className="mt-3 rounded-lg border border-[#DC2626]/20 bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#DC2626]">{error}</p>
        )}
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isLoading}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#D97706]/30 bg-[#FFFBEB] px-4 py-2 text-[13px] font-medium text-[#D97706] transition-colors hover:bg-[#FFEDD5] disabled:opacity-50"
        >
          <Sparkles size={14} />
          {isLoading ? "상담 내용을 정리하고 있어요..." : "AI로 상담 분석하기"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#FFEDD5] text-[#D97706]">
          <Sparkles size={14} />
        </div>
        <p className="text-[13px] font-medium text-[#737373]">AI 상담 분석 결과</p>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-[#0A0A0A]">{result.guardianName}</p>
          {result.careTarget && (
            <p className="mt-0.5 text-[13px] text-[#737373]">
              케어 대상: {result.careTarget}
              {result.careTargetRelationship && ` (${result.careTargetRelationship})`}
            </p>
          )}
        </div>
        <span
          className={[
            "inline-flex w-fit shrink-0 rounded-full border px-3 py-1 text-[13px] font-semibold",
            urgencyStyles[result.urgencyLevel],
          ].join(" ")}
        >
          {result.urgencyLevel === "높음" && "빨리 연락 필요 🔴"}
          {result.urgencyLevel === "보통" && "이번 주 내 연락 🟡"}
          {result.urgencyLevel === "낮음" && "여유 있음 🟢"}
        </span>
      </div>

      <div className="mt-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] p-3 sm:p-4">
        <p className="text-[13px] font-medium text-[#A3A3A3]">상황 요약</p>
        <p className="mt-1 text-[13px] leading-[1.6] text-[#737373]">{result.situationSummary}</p>
      </div>

      {result.keyIssues.length > 0 && (
        <div className="mt-3">
          <p className="text-[13px] font-medium text-[#A3A3A3]">핵심 이슈</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {result.keyIssues.map((issue) => (
              <li
                key={issue}
                className="rounded-full border border-[#E5E5E5] bg-[#FAFAFA] px-2.5 py-1 text-[13px] text-[#0A0A0A]"
              >
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={isLoading}
        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-3 py-1.5 text-[13px] text-[#737373] transition-colors hover:bg-[#FAFAFA] hover:text-[#0A0A0A] disabled:opacity-50"
      >
        {isLoading ? "상담 내용을 정리하고 있어요..." : "다시 분석하기"}
      </button>
    </div>
  );
}
