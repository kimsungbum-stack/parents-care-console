import type { LeadStatus } from "@/types/domain";

export type TernaryFieldValue = "unknown" | "yes" | "no";

export type NewLeadFormValues = {
  guardianName: string;
  phone: string;
  guardianRelationship: string;
  careRecipientName: string;
  careRecipientAgeGroup: string;
  currentSituationSummary: string;
  source: string;
  status: LeadStatus;
  nextContactDate: string;
  keyIssues: string;
  consultationMemo: string;
  hospitalName: string;
  departmentInfo: string;
  examinationRequired: TernaryFieldValue;
  mobilityLevel: string;
  paymentAssistanceRequired: TernaryFieldValue;
  transportMethod: string;
  accompanimentScope: string;
  isHighRisk: boolean;
};

export type NewLeadFormErrors = Partial<Record<keyof NewLeadFormValues, string>>;

export const newLeadStatusOptions: LeadStatus[] = [
  "신규",
  "1차답장",
  "인터뷰예정",
  "인터뷰완료",
  "소개대기",
  "보류",
];

export const relationshipOptions = [
  "아들",
  "딸",
  "배우자",
  "며느리",
  "사위",
  "형제자매",
  "기타",
] as const;

export const ageGroupOptions = [
  "60대",
  "70대 초반",
  "70대 후반",
  "80대 초반",
  "80대 후반",
  "90대 이상",
] as const;

export const ternaryOptions = [
  { value: "unknown", label: "미정" },
  { value: "yes", label: "예" },
  { value: "no", label: "아니오" },
] as const;

export const initialNewLeadFormValues: NewLeadFormValues = {
  guardianName: "",
  phone: "",
  guardianRelationship: "아들",
  careRecipientName: "",
  careRecipientAgeGroup: "",
  currentSituationSummary: "",
  source: "",
  status: "신규",
  nextContactDate: "",
  keyIssues: "",
  consultationMemo: "",
  hospitalName: "",
  departmentInfo: "",
  examinationRequired: "unknown",
  mobilityLevel: "",
  paymentAssistanceRequired: "unknown",
  transportMethod: "",
  accompanimentScope: "",
  isHighRisk: false,
};

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeLeadStatus(value: unknown): LeadStatus {
  return newLeadStatusOptions.includes(value as LeadStatus)
    ? (value as LeadStatus)
    : "신규";
}

function normalizeTernaryFieldValue(value: unknown): TernaryFieldValue {
  return value === "yes" || value === "no" ? value : "unknown";
}

export function normalizeNewLeadFormValues(
  input: Partial<Record<keyof NewLeadFormValues, unknown>>,
): NewLeadFormValues {
  return {
    guardianName: normalizeString(input.guardianName),
    phone: normalizeString(input.phone),
    guardianRelationship: normalizeString(input.guardianRelationship) || "아들",
    careRecipientName: normalizeString(input.careRecipientName),
    careRecipientAgeGroup: normalizeString(input.careRecipientAgeGroup),
    currentSituationSummary: normalizeString(input.currentSituationSummary),
    source: normalizeString(input.source),
    status: normalizeLeadStatus(input.status),
    nextContactDate: normalizeString(input.nextContactDate),
    keyIssues: normalizeString(input.keyIssues),
    consultationMemo: normalizeString(input.consultationMemo),
    hospitalName: normalizeString(input.hospitalName),
    departmentInfo: normalizeString(input.departmentInfo),
    examinationRequired: normalizeTernaryFieldValue(input.examinationRequired),
    mobilityLevel: normalizeString(input.mobilityLevel),
    paymentAssistanceRequired: normalizeTernaryFieldValue(
      input.paymentAssistanceRequired,
    ),
    transportMethod: normalizeString(input.transportMethod),
    accompanimentScope: normalizeString(input.accompanimentScope),
    isHighRisk: Boolean(input.isHighRisk),
  };
}

export function validateNewLeadFormValues(
  values: NewLeadFormValues,
): NewLeadFormErrors {
  const errors: NewLeadFormErrors = {};

  if (!values.guardianName.trim()) {
    errors.guardianName = "보호자명을 입력해 주세요.";
  }

  if (!values.phone.trim()) {
    errors.phone = "연락처를 입력해 주세요.";
  }

  if (!values.currentSituationSummary.trim()) {
    errors.currentSituationSummary = "현재 상황 요약을 입력해 주세요.";
  }

  return errors;
}

export function hasNewLeadFormErrors(errors: NewLeadFormErrors) {
  return Object.values(errors).some(Boolean);
}
