import { LEAD_STATUS_ORDER, type LeadStatus } from "@/types/domain";

export type LeadManagementPayload = {
  leadId: string;
  status: string;
  nextContactDate: string;
};

export type LeadManagementErrors = {
  leadId?: string;
  status?: string;
  nextContactDate?: string;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function normalizeLeadManagementPayload(
  input: Partial<Record<keyof LeadManagementPayload, unknown>>,
): LeadManagementPayload {
  return {
    leadId: normalizeString(input.leadId),
    status: normalizeString(input.status),
    nextContactDate: normalizeString(input.nextContactDate),
  };
}

export function parseLeadStatus(value: string): LeadStatus | null {
  return LEAD_STATUS_ORDER.includes(value as LeadStatus)
    ? (value as LeadStatus)
    : null;
}

export function isValidLeadManagementDate(value: string) {
  return value.length === 0 || DATE_REGEX.test(value);
}

export function validateLeadManagementPayload(
  values: LeadManagementPayload,
): LeadManagementErrors {
  const errors: LeadManagementErrors = {};

  if (!UUID_REGEX.test(values.leadId)) {
    errors.leadId = "유효한 케이스 ID가 아닙니다.";
  }

  if (!parseLeadStatus(values.status)) {
    errors.status = "유효한 상태를 선택해 주세요.";
  }

  if (!isValidLeadManagementDate(values.nextContactDate)) {
    errors.nextContactDate = "다음 연락일 형식을 확인해 주세요.";
  }

  return errors;
}
