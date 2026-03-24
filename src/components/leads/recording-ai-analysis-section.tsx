"use client";

import { Sparkles, Phone, User, FileText } from "lucide-react";
import type { RecordingAiAnalysis } from "@/types/domain";

type RecordingAiAnalysisSectionProps = {
  analysis: RecordingAiAnalysis;
  analyzedAt?: string | null;
};

const urgencyConfig = {
  "높음": {
    label: "빨리 연락 필요 🔴",
    dot: "bg-[#DC2626]",
    badge: "border-[#DC2626]/20 bg-[#FEF2F2] text-[#DC2626]",
  },
  "보통": {
    label: "이번 주 내 연락 🟡",
    dot: "bg-[#D97706]",
    badge: "border-[#D97706]/20 bg-[#FFFBEB] text-[#D97706]",
  },
  "낮음": {
    label: "여유 있음 🟢",
    dot: "bg-[#16A34A]",
    badge: "border-[#16A34A]/20 bg-[#F0FDF4] text-[#16A34A]",
  },
} as const;

function formatAnalyzedDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecordingAiAnalysisSection({ analysis, analyzedAt }: RecordingAiAnalysisSectionProps) {
  const urgency = urgencyConfig[analysis.urgency];

  return (
    <div className="rounded-xl border border-[#E7E0D5] bg-white p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#D97706]">
            <Sparkles size={14} />
          </div>
          <p className="text-[14px] font-bold text-[#292524]">AI 분석 결과</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-semibold ${urgency.badge}`}>
          <span className={`inline-block h-2 w-2 rounded-full ${urgency.dot}`} />
          {urgency.label}
        </span>
      </div>

      {analyzedAt && (
        <p className="mt-1 text-[13px] text-[#A8A29E]">
          {formatAnalyzedDate(analyzedAt)} AI 자동 분석
        </p>
      )}

      {/* Info Grid */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Guardian Info */}
        <div className="flex items-start gap-2 rounded-lg border border-[#E7E0D5] bg-[#FEFCF8] p-3">
          <User size={16} className="mt-0.5 shrink-0 text-[#A8A29E]" />
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[#A8A29E]">보호자 정보</p>
            <p className="mt-0.5 text-[15px] font-semibold text-[#292524]">
              {analysis.guardianName || "미확인"}
            </p>
            {analysis.relationship && (
              <p className="text-[13px] text-[#78716C]">관계: {analysis.relationship}</p>
            )}
            {analysis.phone && (
              <p className="text-[13px] text-[#78716C]">{analysis.phone}</p>
            )}
          </div>
        </div>

        {/* Care Recipient */}
        <div className="flex items-start gap-2 rounded-lg border border-[#E7E0D5] bg-[#FEFCF8] p-3">
          <Phone size={16} className="mt-0.5 shrink-0 text-[#A8A29E]" />
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[#A8A29E]">케어 대상</p>
            <p className="mt-0.5 text-[15px] font-semibold text-[#292524]">
              {analysis.careRecipientName || "미확인"}
            </p>
            {analysis.careRecipientAge && (
              <p className="text-[13px] text-[#78716C]">{analysis.careRecipientAge}</p>
            )}
          </div>
        </div>
      </div>

      {/* Situation Summary */}
      <div className="mt-3 rounded-lg border border-[#E7E0D5] bg-[#FEFCF8] p-3 sm:p-4">
        <div className="flex items-start gap-2">
          <FileText size={16} className="mt-0.5 shrink-0 text-[#A8A29E]" />
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[#A8A29E]">상황 요약</p>
            <p className="mt-1 text-[13px] leading-[1.6] text-[#78716C]">{analysis.currentSituation}</p>
          </div>
        </div>
      </div>

      {/* Core Needs */}
      {analysis.coreNeeds && (
        <div className="mt-3 rounded-lg border border-[#E7E0D5] bg-[#FEFCF8] p-3 sm:p-4">
          <p className="text-[13px] font-medium text-[#A8A29E]">핵심 니즈</p>
          <p className="mt-1 text-[13px] leading-[1.6] text-[#78716C]">{analysis.coreNeeds}</p>
        </div>
      )}

      {/* Recommended Action */}
      {analysis.recommendedAction && (
        <div className="mt-3 rounded-lg border border-[#D97706]/20 bg-[#FFFBEB] p-3 sm:p-4">
          <p className="text-[13px] font-medium text-[#D97706]">다음 연락 추천</p>
          <p className="mt-1 text-[13px] leading-[1.6] text-[#92400E]">{analysis.recommendedAction}</p>
          {analysis.recommendedNextContactDate && (
            <p className="mt-1 text-[13px] font-semibold text-[#D97706]">
              권장일: {new Date(analysis.recommendedNextContactDate).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
