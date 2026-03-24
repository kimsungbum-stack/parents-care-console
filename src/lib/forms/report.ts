import type { GuardianReportRecord } from "@/types/domain";

export type GuardianReportValue = {
  currentSituation: string;
  thisWeekTasks: string;
  hospitalSchedule: string;
  neededHelp: string;
  nextAction: string;
};

export type LeadReportPayload = {
  leadId: string;
  report: GuardianReportValue;
};

export type LeadReportErrors = {
  leadId?: string;
  report?: string;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function normalizeGuardianReportValue(
  input: Partial<Record<keyof GuardianReportValue, unknown>>,
): GuardianReportValue {
  return {
    currentSituation: normalizeString(input.currentSituation),
    thisWeekTasks: normalizeString(input.thisWeekTasks),
    hospitalSchedule: normalizeString(input.hospitalSchedule),
    neededHelp: normalizeString(input.neededHelp),
    nextAction: normalizeString(input.nextAction),
  };
}

export function normalizeLeadReportPayload(input: {
  leadId?: unknown;
  report?: unknown;
}): LeadReportPayload {
  return {
    leadId: normalizeString(input.leadId),
    report: normalizeGuardianReportValue(
      (typeof input.report === "object" && input.report !== null
        ? input.report
        : {}) as Partial<Record<keyof GuardianReportValue, unknown>>,
    ),
  };
}

export function validateLeadReportPayload(
  values: LeadReportPayload,
): LeadReportErrors {
  const errors: LeadReportErrors = {};

  if (!UUID_REGEX.test(values.leadId)) {
    errors.leadId = "유효한 리드 ID가 아닙니다.";
  }

  const hasInvalidField = Object.values(values.report).some(
    (value) => typeof value !== "string",
  );

  if (hasInvalidField) {
    errors.report = "리포트 입력 구조를 다시 확인해 주세요.";
  }

  return errors;
}

export function mapGuardianReportRecordToValue(
  record: GuardianReportRecord,
): GuardianReportValue {
  return {
    currentSituation: record.currentSituation,
    thisWeekTasks: record.thisWeekTasks,
    hospitalSchedule: record.hospitalSchedule,
    neededHelp: record.neededHelp,
    nextAction: record.nextAction,
  };
}
