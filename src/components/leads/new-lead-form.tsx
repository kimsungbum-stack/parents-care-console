"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
          message: payload.message ?? "리드를 저장하지 못했어요. 입력값을 다시 확인해 주세요.",
        });
        return;
      }

      setSubmitState({
        tone: "success",
        message: "리드를 등록했어요. 상세 화면에서 상태와 상담 기록을 이어서 정리하면 돼요.",
      });

      window.setTimeout(() => {
        router.push(`/leads/${payload.leadId}`);
      }, 700);
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {submitState ? <FeedbackNotice tone={submitState.tone} message={submitState.message} /> : null}

      <section className="rounded-xl border border-[#E7E0D5] bg-white p-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)] xl:items-end">
          <div>
            <h2 className="text-[20px] font-bold text-[#292524]">
              문의가 들어오면 여기서 시작하면 돼요.
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-[1.6] text-[#78716C]">
              처음부터 모든 정보를 다 채울 필요는 없어요. 보호자명, 연락처, 현재 상황만 먼저 등록하고,
              상세 화면에서 상태와 후속 기록을 차례대로 붙이면 돼요.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {[
              { label: "1단계", title: "기본 정보 등록", desc: "보호자명, 연락처, 현재 상황, 유입경로만 먼저 적어요." },
              { label: "2단계", title: "상세 화면 이동", desc: "저장 후 바로 상세 화면으로 가서 상태와 다음 연락일을 정리해요." },
              { label: "3단계", title: "후속 기록 이어쓰기", desc: "상담 기록, 리포트, 운영 메모는 상세 화면에서 이어서 남기면 돼요." },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-[#E7E0D5] bg-[#FEFCF8] px-4 py-3">
                <p className="text-[13px] font-bold text-[#D97706]">{item.label}</p>
                <p className="mt-1 text-[15px] font-semibold text-[#292524]">{item.title}</p>
                <p className="mt-1 text-[13px] leading-[1.6] text-[#78716C]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <FormSection title="보호자 정보" description="전화나 문의가 들어오면 여기부터 채우면 돼요.">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="보호자명" required error={errors.guardianName}>
                <input type="text" value={values.guardianName} onChange={(event) => setFieldValue("guardianName", event.target.value)} placeholder="예: 김민정" className={getInputClass(Boolean(errors.guardianName))} />
              </FormField>
              <FormField label="연락처" required error={errors.phone}>
                <input type="text" value={values.phone} onChange={(event) => setFieldValue("phone", event.target.value)} placeholder="예: 010-1234-5678" className={getInputClass(Boolean(errors.phone))} />
              </FormField>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="보호자와 부모님의 관계">
                <select value={values.guardianRelationship} onChange={(event) => setFieldValue("guardianRelationship", event.target.value)} className={getInputClass(false)}>
                  {relationshipOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </FormField>
              <FormField label="유입경로" required error={errors.source}>
                <input type="text" value={values.source} onChange={(event) => setFieldValue("source", event.target.value)} placeholder="예: 네이버 검색, 지인 소개" className={getInputClass(Boolean(errors.source))} />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="케어 대상 정보" description="부모님 상황을 짧게 정리해 두면 이후 설명이 쉬워져요.">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="케어 대상 이름 또는 호칭">
                <input type="text" value={values.careRecipientName} onChange={(event) => setFieldValue("careRecipientName", event.target.value)} placeholder="예: 부친, 모친, 김정호" className={getInputClass(false)} />
              </FormField>
              <FormField label="케어 대상 연령대">
                <select value={values.careRecipientAgeGroup} onChange={(event) => setFieldValue("careRecipientAgeGroup", event.target.value)} className={getInputClass(false)}>
                  <option value="">선택하세요</option>
                  {ageGroupOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </FormField>
            </div>
            <FormField label="현재 상황 요약" required error={errors.currentSituationSummary}>
              <textarea value={values.currentSituationSummary} onChange={(event) => setFieldValue("currentSituationSummary", event.target.value)} placeholder="예: 외래 일정이 잦아 보호자의 병원동행 부담이 커진 상황" rows={5} className={`${getInputClass(Boolean(errors.currentSituationSummary))} min-h-[132px] resize-y leading-[1.6]`} />
            </FormField>
          </FormSection>

          <FormSection title="운영 정보" description="꼭 필요한 운영 정보만 정리하고, 나머지는 상세 화면에서 이어가면 돼요.">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="현재 상태">
                <select value={values.status} onChange={(event) => setFieldValue("status", event.target.value as NewLeadFormValues["status"])} className={getInputClass(false)}>
                  {newLeadStatusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </FormField>
              <FormField label="다음 연락일">
                <input type="date" value={values.nextContactDate} onChange={(event) => setFieldValue("nextContactDate", event.target.value)} className={getInputClass(false)} />
              </FormField>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="병원명">
                <input type="text" value={values.hospitalName} onChange={(event) => setFieldValue("hospitalName", event.target.value)} placeholder="예: 서울중앙병원" className={getInputClass(false)} />
              </FormField>
              <FormField label="진료과 정보 또는 수">
                <input type="text" value={values.departmentInfo} onChange={(event) => setFieldValue("departmentInfo", event.target.value)} placeholder="예: 정형외과, 신경과 / 2개과" className={getInputClass(false)} />
              </FormField>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="검사 여부">
                <select value={values.examinationRequired} onChange={(event) => setFieldValue("examinationRequired", event.target.value as NewLeadFormValues["examinationRequired"])} className={getInputClass(false)}>
                  {ternaryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </FormField>
              <FormField label="보행 수준">
                <input type="text" value={values.mobilityLevel} onChange={(event) => setFieldValue("mobilityLevel", event.target.value)} placeholder="예: 휠체어 보조 필요" className={getInputClass(false)} />
              </FormField>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="수납/결제 보조 필요 여부">
                <select value={values.paymentAssistanceRequired} onChange={(event) => setFieldValue("paymentAssistanceRequired", event.target.value as NewLeadFormValues["paymentAssistanceRequired"])} className={getInputClass(false)}>
                  {ternaryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </FormField>
              <FormField label="이동 방식">
                <input type="text" value={values.transportMethod} onChange={(event) => setFieldValue("transportMethod", event.target.value)} placeholder="예: 자가용, 택시, 병원 셔틀" className={getInputClass(false)} />
              </FormField>
            </div>
            <FormField label="동행 필요 구간">
              <textarea value={values.accompanimentScope} onChange={(event) => setFieldValue("accompanimentScope", event.target.value)} placeholder="예: 접수, 검사실 이동, 수납, 귀가 동행" rows={4} className={`${getInputClass(false)} min-h-[112px] resize-y leading-[1.6]`} />
            </FormField>
            <FormField label="핵심 문제">
              <textarea value={values.keyIssues} onChange={(event) => setFieldValue("keyIssues", event.target.value)} placeholder="예: 병원동행 부담, 일정 정리 필요, 센터 연계 검토" rows={4} className={`${getInputClass(false)} min-h-[112px] resize-y leading-[1.6]`} />
            </FormField>
            <label className="flex items-start gap-3 rounded-lg border border-[#E7E0D5] bg-[#FEFCF8] px-4 py-4">
              <input type="checkbox" checked={values.isHighRisk} onChange={(event) => setFieldValue("isHighRisk", event.target.checked)} className={getCheckboxClass()} />
              <div>
                <p className="text-[15px] font-medium text-[#292524]">고위험 여부</p>
                <p className="mt-1 text-[13px] leading-[1.6] text-[#78716C]">낙상 위험, 복잡한 이동 동선, 높은 보호자 부담으로 우선 관리가 필요한 경우 체크해요.</p>
              </div>
            </label>
          </FormSection>

          <FormSection title="메모" description="첫 통화에서 기억해야 할 내용만 간단히 남겨도 충분해요.">
            <FormField label="상담 메모">
              <textarea value={values.consultationMemo} onChange={(event) => setFieldValue("consultationMemo", event.target.value)} placeholder="첫 통화에서 확인한 배경, 약속 내용, 후속 체크 포인트를 적어요." rows={5} className={`${getInputClass(false)} min-h-[132px] resize-y leading-[1.6]`} />
            </FormField>
          </FormSection>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-xl border border-[#E7E0D5] bg-white p-5">
            <h3 className="text-[16px] font-bold text-[#292524]">이 화면은 이렇게 쓰면 돼요</h3>
            <div className="mt-3 space-y-2 text-[15px] leading-[1.6] text-[#78716C]">
              <p>1. 보호자명, 연락처, 현재 상황만 먼저 적어요.</p>
              <p>2. 저장 후 상세 화면에서 상태와 다음 연락일을 정리해요.</p>
              <p>3. 후속 통화가 끝날 때마다 상담 기록과 메모를 추가해요.</p>
            </div>
          </section>

          <section className="rounded-xl border border-[#E7E0D5] bg-white p-5">
            <h3 className="text-[16px] font-bold text-[#292524]">현재 입력 요약</h3>
            <div className="mt-3 grid gap-3 text-[13px]">
              {[
                { label: "보호자명", value: values.guardianName || "-" },
                { label: "연락처", value: values.phone || "-" },
                { label: "현재 상태", value: values.status },
                { label: "병원명", value: values.hospitalName || "-" },
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
        <div>
          <p className="text-[15px] font-semibold text-[#292524]">등록만 끝내면 이후 흐름은 상세 화면에서 이어져요.</p>
          <p className="mt-1 text-[13px] leading-[1.6] text-[#78716C]">
            저장 후 상세 화면으로 이동해 상태 변경, 상담 기록, 메모 관리를 이어서 진행할 수 있어요.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/leads" className="control-button-secondary inline-flex">
            목록으로 돌아가기
          </Link>
          <button type="submit" disabled={isSubmitting} className="control-button-primary inline-flex">
            {isSubmitting ? "저장 중..." : "리드 저장하기"}
          </button>
        </div>
      </div>
    </form>
  );
}
