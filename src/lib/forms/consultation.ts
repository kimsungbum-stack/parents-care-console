import type { LeadConsultation } from "@/types/domain";

export type LeadConsultationInputValue = {
  consultedAt: string;
  channel: string;
  summary: string;
  details: string;
};

export type LeadConsultationPayload = {
  leadId: string;
  consultedAt: string;
  channel: string;
  summary: string;
  details: string;
};

export type LeadConsultationErrors = {
  leadId?: string;
  consultedAt?: string;
  channel?: string;
  summary?: string;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATETIME_LOCAL_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export const consultationChannelOptions = [
  "전화",
  "문자",
  "카톡",
  "대면",
  "기타",
] as const;

function getDefaultConsultedAt() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export const initialLeadConsultationValue: LeadConsultationInputValue = {
  consultedAt: getDefaultConsultedAt(),
  channel: "전화",
  summary: "",
  details: "",
};

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function normalizeLeadConsultationPayload(input: {
  leadId?: unknown;
  consultedAt?: unknown;
  channel?: unknown;
  summary?: unknown;
  details?: unknown;
}): LeadConsultationPayload {
  return {
    leadId: normalizeString(input.leadId),
    consultedAt: normalizeString(input.consultedAt),
    channel: normalizeString(input.channel),
    summary: normalizeString(input.summary),
    details: normalizeString(input.details),
  };
}

export function validateLeadConsultationPayload(
  values: LeadConsultationPayload,
): LeadConsultationErrors {
  const errors: LeadConsultationErrors = {};

  if (!UUID_REGEX.test(values.leadId)) {
    errors.leadId = "유효한 리드 ID가 아닙니다.";
  }

  if (!DATETIME_LOCAL_REGEX.test(values.consultedAt)) {
    errors.consultedAt = "상담일시 형식을 다시 확인해 주세요.";
  }

  if (!values.channel.trim()) {
    errors.channel = "상담 채널을 입력해 주세요.";
  }

  if (!values.summary.trim()) {
    errors.summary = "상담 요약을 입력해 주세요.";
  }

  return errors;
}

export function formatConsultedAtForDisplay(value: string) {
  return value.replace("T", " ");
}

export function mapLeadConsultationToInputValue(
  consultation: LeadConsultation,
): LeadConsultationInputValue {
  return {
    consultedAt: consultation.consultedAt.slice(0, 16),
    channel: consultation.channel,
    summary: consultation.summary,
    details: consultation.details,
  };
}
