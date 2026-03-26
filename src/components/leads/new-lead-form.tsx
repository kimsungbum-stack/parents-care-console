"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { FormField } from "@/components/leads/form-field";
import { FormSection } from "@/components/leads/form-section";
import { FeedbackNotice } from "@/components/ui/feedback-notice";
import {
  ageGroupOptions,
  hasNewLeadFormErrors,
  initialNewLeadFormValues,
  newLeadStatusOptions,
  relationshipOptions,
  ternaryOptions,
  type NewLeadFormErrors,
  type NewLeadFormValues,
  validateNewLeadFormValues,
} from "@/lib/forms/new-lead";
import { getStatusLabel } from "@/types/domain";

type SubmitState =
  | {
      tone: "success" | "error";
      message: string;
    }
  | null;

function getInputClass(hasError: boolean) {
  return [
    "w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-[#292524] outline-none transition-colors placeholder:text-[#A8A29E] min-h-[44px]",
    hasError
      ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]/20"
      : "border-[#E7E0D5] focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/20",
  ].join(" ");
}

function getCheckboxClass() {
  return "mt-1 h-4 w-4 rounded border-[#E7E0D5] bg-white text-[#D97706] focus:ring-[#D97706]/20";
}

export function NewLeadForm() {
  const router = useRouter();
  const [values, setValues] = useState<NewLeadFormValues>(initialNewLeadFormValues);
  const [errors, setErrors] = useState<NewLeadFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>(null);
  const [showMore, setShowMore] = useState(false);

  const setFieldValue = <K extends keyof NewLeadFormValues>(
    key: K,
    value: NewLeadFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitState(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateNewLeadFormValues(values);
    setErrors(nextErrors);

    if (hasNewLeadFormErrors(nextErrors)) {
      setSubmitState({
        tone: "error",
        message: "필수 입력값을 확인해 주세요.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitState(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as {
        leadId?: string;
        message?: string;
        fieldErrors?: NewLeadFormErrors;
      };

      if (!response.ok) {
        if (payload.fieldErrors) {
          setErrors((current) => ({ ...current, ...payload.fieldErrors }));
        }
        setSubmitState({
          tone: "error",
          message: payload.message ?? "케이스를 저장하지 못했어요. 입력값을 다시 확인해 주세요.",
        });
        return;
      }

      router.push(`/leads/${payload.leadId}`);
    } catch {
      setSubmitState({
        tone: "error",
        message: "저장 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitState ? <FeedbackNotice tone={submitState.tone} message={submitState.message} /> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          {/* 필수 3개 필드 — 항상 노출 */}
          <section className="rounded-xl border border-[#E7E0D5] bg-white p-5">
            <h2 className="text-[18px] font-bold text-[#292524]">신규 케이스 등록</h2>
            <p className="mb-5 mt-1 text-[14px] text-[#78716C]">
              3가지만 입력하면 30초 안에 등록 완료예요.
            </p>

            <div className="space-y-4">
              <FormField label="보호자명" required error={errors.guardianName}>
                <input
                  type="text"
                  value={values.guardianName}
                  onChange={(e) => setFieldValue("guardianName", e.target.value)}
                  placeholder="예: 김민정"
                  className={getInputClass(Boolean(errors.guardianName))}
                />
              </FormField>

              <FormField label="연락처" required error={errors.phone}>
                <input
                  type="text"
                  value={values.phone}
                  onChange={(e) => setFieldValue("phone", e.target.value)}
                  placeholder="예: 010-1234-5678"
                  className={getInputClass(Boolean(errors.phone))}
                />
              </FormField>

              <FormField label="현재 상황" required error={errors.currentSituationSummary}>
                <textarea
                  value={values.currentSituationSummary}
                  onChange={(e) => setFieldValue("currentSituationSummary", e.target.value)}
                  placeholder="예: 외래 일정이 잦아 보호자의 병원동행 부담이 커진 상황"
                  rows={4}
                  className={`${getInputClass(Boolean(errors.currentSituationSummary))} min-h-[100px] resize-y leading-[1.6]`}
                />
              </FormField>
            </div>

            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#E7E0D5] bg-[#FEFCF8] px-4 py-3 text-[14px] font-medium text-[#78716C] transition-colors hover:bg-[#F5EFE6] hover:text-[#292524]"
            >
              {showMore ? (
                <><ChevronUp size={16} /> 접기</>
              ) : (
                <><ChevronDown size={16} /> 더보기 — 유입경로, 케어 대상, 운영 정보</>
              )}
            </button>
          </section>

          {/* 추가 필드 — 더보기 시 노출 */}
          {showMore && (
            <>
              <FormSection title="보호자 추가 정보" description="필요한 경우에만 채워요.">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="보호자와 부모님의 관계">
                    <select
                      value={values.guardianRelationship}
                      onChange={(e) => setFieldValue("guardianRelationship", e.target.value)}
                      className={getInputClass(false)}
                    >
                      {relationshipOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="유입경로">
                    <input
                      type="text"
                      value={values.source}
                      onChange={(e) => setFieldValue("source", e.target.value)}
                      placeholder="예: 네이버 검색, 지인 소개"
                      className={getInputClass(false)}
                    />
                  </FormField>
                </div>
              </FormSection>

              <FormSection title="케어 대상 정보" description="부모님 상황을 짧게 정리해 두면 이후 설명이 쉬워져요.">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="케어 대상 이름 또는 호칭">
                    <input
                      type="text"
                      value={values.careRecipientName}
                      onChange={(e) => setFieldValue("careRecipientName", e.target.value)}
                      placeholder="예: 부친, 모친, 김정호"
                      className={getInputClass(false)}
                    />
                  </FormField>
                  <FormField label="케어 대상 연령대">
                    <select
                      value={values.careRecipientAgeGroup}
                      onChange={(e) => setFieldValue("careRecipientAgeGroup", e.target.value)}
                      className={getInputClass(false)}
                    >
                      <option value="">선택하세요</option>
                      {ageGroupOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </FormSection>

              <FormSection title="운영 정보" description="꼭 필요한 운영 정보만 정리하고, 나머지는 상세 화면에서 이어가면 돼요.">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="현재 상태">
                    <select
                      value={values.status}
                      onChange={(e) => setFieldValue("status", e.target.value as NewLeadFormValues["status"])}
                      className={getInputClass(false)}
                    >
                      {newLeadStatusOptions.map((option) => (
                        <option key={option} value={option}>{getStatusLabel(option)}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="다음 연락일">
                    <input
                      type="date"
                      value={values.nextContactDate}
                      onChange={(e) => setFieldValue("nextContactDate", e.target.value)}
                      className={getInputClass(false)}
                    />
                  </FormField>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="병원명">
                    <input
                      type="text"
                      value={values.hospitalName}
                      onChange={(e) => setFieldValue("hospitalName", e.target.value)}
                      placeholder="예: 서울중앙병원"
                      className={getInputClass(false)}
                    />
                  </FormField>
                  <FormField label="진료과 정보 또는 수">
                    <input
                      type="text"
                      value={values.departmentInfo}
                      onChange={(e) => setFieldValue("departmentInfo", e.target.value)}
                      placeholder="예: 정형외과, 신경과 / 2개과"
                      className={getInputClass(false)}
                    />
                  </FormField>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="검사 여부">
                    <select
                      value={values.examinationRequired}
                      onChange={(e) => setFieldValue("examinationRequired", e.target.value as NewLeadFormValues["examinationRequired"])}
                      className={getInputClass(false)}
                    >
                      {ternaryOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="보행 수준">
                    <input
                      type="text"
                      value={values.mobilityLevel}
                      onChange={(e) => setFieldValue("mobilityLevel", e.target.value)}
                      placeholder="예: 휠체어 보조 필요"
                      className={getInputClass(false)}
                    />
                  </FormField>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="수납/결제 보조 필요 여부">
                    <select
                      value={values.paymentAssistanceRequired}
                      onChange={(e) => setFieldValue("paymentAssistanceRequired", e.target.value as NewLeadFormValues["paymentAssistanceRequired"])}
                      className={getInputClass(false)}
                    >
                      {ternaryOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="이동 방식">
                    <input
                      type="text"
                      value={values.transportMethod}
                      onChange={(e) => setFieldValue("transportMethod", e.target.value)}
                      placeholder="예: 자가용, 택시, 병원 셔틀"
                      className={getInputClass(false)}
                    />
                  </FormField>
                </div>
                <FormField label="동행 필요 구간">
                  <textarea
                    value={values.accompanimentScope}
                    onChange={(e) => setFieldValue("accompanimentScope", e.target.value)}
                    placeholder="예: 접수, 검사실 이동, 수납, 귀가 동행"
                    rows={4}
                    className={`${getInputClass(false)} min-h-[112px] resize-y leading-[1.6]`}
                  />
                </FormField>
                <FormField label="핵심 문제">
                  <textarea
                    value={values.keyIssues}
                    onChange={(e) => setFieldValue("keyIssues", e.target.value)}
                    placeholder="예: 병원동행 부담, 일정 정리 필요, 센터 연계 검토"
                    rows={4}
                    className={`${getInputClass(false)} min-h-[112px] resize-y leading-[1.6]`}
                  />
                </FormField>
                <label className="flex items-start gap-3 rounded-lg border border-[#E7E0D5] bg-[#FEFCF8] px-4 py-4">
                  <input
                    type="checkbox"
                    checked={values.isHighRisk}
                    onChange={(e) => setFieldValue("isHighRisk", e.target.checked)}
                    className={getCheckboxClass()}
                  />
                  <div>
                    <p className="text-[15px] font-medium text-[#292524]">고위험 여부</p>
                    <p className="mt-1 text-[13px] leading-[1.6] text-[#78716C]">
                      낙상 위험, 복잡한 이동 동선, 높은 보호자 부담으로 우선 관리가 필요한 경우 체크해요.
                    </p>
                  </div>
                </label>
              </FormSection>

              <FormSection title="메모" description="첫 통화에서 기억해야 할 내용만 간단히 남겨도 충분해요.">
                <FormField label="상담 메모">
                  <textarea
                    value={values.consultationMemo}
                    onChange={(e) => setFieldValue("consultationMemo", e.target.value)}
                    placeholder="첫 통화에서 확인한 배경, 약속 내용, 후속 체크 포인트를 적어요."
                    rows={5}
                    className={`${getInputClass(false)} min-h-[132px] resize-y leading-[1.6]`}
                  />
                </FormField>
              </FormSection>
            </>
          )}
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-xl border border-[#E7E0D5] bg-white p-5">
            <h3 className="text-[16px] font-bold text-[#292524]">이 화면은 이렇게 쓰면 돼요</h3>
            <div className="mt-3 space-y-2 text-[14px] leading-[1.6] text-[#78716C]">
              <p>1. 보호자명, 연락처, 현재 상황만 먼저 적어요.</p>
              <p>2. 저장 후 상세 화면에서 상태와 다음 연락일을 정리해요.</p>
              <p>3. 후속 통화가 끝날 때마다 상담 기록과 메모를 추가해요.</p>
            </div>
          </section>

          <section className="rounded-xl border border-[#E7E0D5] bg-white p-5">
            <h3 className="text-[16px] font-bold text-[#292524]">현재 입력 요약</h3>
            <div className="mt-3 grid gap-3">
              {[
                { label: "보호자명", value: values.guardianName || "-" },
                { label: "연락처", value: values.phone || "-" },
                { label: "현재 상태", value: values.status },
                { label: "다음 연락일", value: values.nextContactDate || "-" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-[#E7E0D5] bg-[#FEFCF8] px-4 py-3">
                  <p className="text-[13px] font-medium text-[#A8A29E]">{item.label}</p>
                  <p className="mt-1 text-[15px] font-semibold text-[#292524]">{item.value}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E7E0D5] bg-white px-5 py-5">
        <p className="text-[14px] text-[#78716C]">저장하면 바로 상세 화면으로 이동해요.</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/leads" className="control-button-secondary inline-flex min-h-[44px] items-center">
            목록으로 돌아가기
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="control-button-primary inline-flex min-h-[44px] items-center"
          >
            {isSubmitting ? "저장 중..." : "케이스 저장하기"}
          </button>
        </div>
      </div>
    </form>
  );
}
