"use client";

import type { ConsultationAnalysis } from "@/types/ai";

type Props = {
  analysis: ConsultationAnalysis | null;
  isLoading: boolean;
};

const urgencyColors: Record<string, string> = {
  높음: "bg-red-100 text-red-700",
  보통: "bg-yellow-100 text-yellow-700",
  낮음: "bg-green-100 text-green-700",
};

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-[#E7E0D5]/50 ${className}`} />
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-sm font-semibold text-[#292524]">{children}</h3>
  );
}

export default function AIAnalysisCard({ analysis, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#E7E0D5] bg-white p-5 space-y-4">
        <SkeletonBlock className="h-5 w-40" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-2/3" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-1/2" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="rounded-lg border border-[#E7E0D5] bg-white p-5">
        <p className="text-sm text-[#78716C]">분석 결과 없음</p>
      </div>
    );
  }

  const { guardian, care_target, consultation, recommendation } = analysis;

  return (
    <div className="rounded-lg border border-[#E7E0D5] bg-white p-5 space-y-5">
      {/* 보호자 정보 */}
      <section>
        <SectionTitle>보호자 정보</SectionTitle>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-[#78716C]">이름</dt>
          <dd className="text-[#292524]">{guardian.name}</dd>
          {guardian.phone && (
            <>
              <dt className="text-[#78716C]">전화번호</dt>
              <dd className="text-[#292524]">{guardian.phone}</dd>
            </>
          )}
          {guardian.relation && (
            <>
              <dt className="text-[#78716C]">관계</dt>
              <dd className="text-[#292524]">{guardian.relation}</dd>
            </>
          )}
        </dl>
      </section>

      {/* 케어 대상 */}
      <section>
        <SectionTitle>케어 대상</SectionTitle>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {care_target.name && (
            <>
              <dt className="text-[#78716C]">이름</dt>
              <dd className="text-[#292524]">{care_target.name}</dd>
            </>
          )}
          {care_target.age_group && (
            <>
              <dt className="text-[#78716C]">연령대</dt>
              <dd className="text-[#292524]">{care_target.age_group}</dd>
            </>
          )}
          {care_target.condition && (
            <>
              <dt className="text-[#78716C]">상태</dt>
              <dd className="text-[#292524]">{care_target.condition}</dd>
            </>
          )}
          {!care_target.name && !care_target.age_group && !care_target.condition && (
            <dd className="col-span-2 text-[#78716C]">정보 없음</dd>
          )}
        </dl>
      </section>

      {/* 상담 요약 */}
      <section>
        <SectionTitle>상담 요약</SectionTitle>
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${urgencyColors[consultation.urgency]}`}
          >
            긴급도: {consultation.urgency}
          </span>
        </div>
        <p className="mb-3 text-sm text-[#292524] leading-relaxed">
          {consultation.summary}
        </p>
        {consultation.key_needs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {consultation.key_needs.map((need, i) => (
              <span
                key={i}
                className="inline-block rounded-full border border-[#E7E0D5] bg-[#FAFAF9] px-2.5 py-0.5 text-xs text-[#292524]"
              >
                {need}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* 추천 액션 */}
      <section>
        <SectionTitle>추천 액션</SectionTitle>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-full bg-[#D97706]/10 px-2.5 py-0.5 text-xs font-medium text-[#D97706]">
              {recommendation.pipeline_stage}
            </span>
          </div>
          <p className="text-[#292524]">{recommendation.next_action}</p>
          {recommendation.next_contact && (
            <p className="text-[#78716C]">
              다음 연락: {recommendation.next_contact}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
