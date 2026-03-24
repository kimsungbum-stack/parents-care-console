import type {
  GuardianReportRecord,
  LeadConsultation,
  LeadDetail,
  LeadListItem,
  LeadNote,
  LeadRecord,
  RecordingAiAnalysis,
} from "@/types/domain";
import type { Database } from "@/types/supabase";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type ConsultationRow = Database["public"]["Tables"]["consultations"]["Row"];
type ReportRow = Database["public"]["Tables"]["reports"]["Row"];
type NoteRow = Database["public"]["Tables"]["notes"]["Row"];

function formatDateLabel(value: string | null) {
  return value ? value.slice(0, 10) : "-";
}

function truncate(value: string, length: number) {
  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, length).trim()}...`;
}

function buildCareSummary(row: LeadRow) {
  const recipientLabel = [row.care_recipient_age_group, row.care_recipient_name]
    .filter(Boolean)
    .join(" ");
  const situationLabel = truncate(row.current_situation_summary, 28);

  if (recipientLabel) {
    return `${recipientLabel} · ${situationLabel}`;
  }

  return situationLabel;
}

export function mapLeadRowToLeadRecord(row: LeadRow): LeadRecord {
  return {
    id: row.id,
    guardianName: row.guardian_name,
    phone: row.phone,
    guardianRelationship: row.guardian_relationship,
    careRecipientName: row.care_recipient_name,
    careRecipientAgeGroup: row.care_recipient_age_group,
    currentSituationSummary: row.current_situation_summary,
    source: row.source,
    status: row.status,
    nextContactDate: row.next_contact_date,
    keyIssues: row.key_issues,
    consultationMemo: row.consultation_memo,
    hospitalName: row.hospital_name,
    departmentInfo: row.department_info,
    examinationRequired: row.examination_required,
    mobilityLevel: row.mobility_level,
    paymentAssistanceRequired: row.payment_assistance_required,
    transportMethod: row.transport_method,
    accompanimentScope: row.accompaniment_scope,
    isHighRisk: row.is_high_risk,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapLeadRowToLeadListItem(
  row: LeadRow,
  options?: {
    latestConsultationDate?: string | null;
  },
): LeadListItem {
  const record = mapLeadRowToLeadRecord(row);

  return {
    id: record.id,
    guardianName: record.guardianName,
    phone: record.phone,
    careSummary: buildCareSummary(row),
    source: record.source,
    status: record.status,
    nextContactDate: record.nextContactDate,
    latestConsultationDate: formatDateLabel(
      options?.latestConsultationDate ?? record.updatedAt,
    ),
  };
}

export function mapConsultationRowToLeadConsultation(
  row: ConsultationRow,
): LeadConsultation {
  return {
    id: row.id,
    leadId: row.lead_id,
    consultedAt: row.consulted_at,
    channel: row.channel ?? "미정",
    summary: row.summary,
    details: row.details ?? "",
    createdAt: row.created_at,
  };
}

export function mapReportRowToGuardianReportRecord(
  row: ReportRow,
): GuardianReportRecord {
  return {
    id: row.id,
    leadId: row.lead_id,
    currentSituation: row.current_situation,
    thisWeekTasks: row.this_week_tasks,
    hospitalSchedule: row.hospital_schedule,
    neededHelp: row.needed_help,
    nextAction: row.next_action,
    updatedAt: row.updated_at,
  };
}

export function mapNoteRowToLeadNote(row: NoteRow): LeadNote {
  return {
    id: row.id,
    leadId: row.lead_id,
    type: row.note_type === "partner" ? "파트너 메모" : "운영 메모",
    createdAt: row.created_at,
    content: row.content,
  };
}

export function mapLeadRowsToLeadDetail(input: {
  lead: LeadRow;
  consultations: ConsultationRow[];
  report: ReportRow | null;
  notes: NoteRow[];
}): LeadDetail {
  const leadRecord = mapLeadRowToLeadRecord(input.lead);
  const reportRecord = input.report
    ? mapReportRowToGuardianReportRecord(input.report)
    : null;
  const consultations = input.consultations.map(mapConsultationRowToLeadConsultation);
  const notes = input.notes.map(mapNoteRowToLeadNote);
  const latestConsultationDate =
    consultations[0]?.consultedAt?.slice(0, 10) ?? formatDateLabel(leadRecord.updatedAt);

  return {
    ...leadRecord,
    careSummary: buildCareSummary(input.lead),
    latestConsultationDate,
    careRecipientAge: undefined,
    parentSituationSummary:
      reportRecord?.currentSituation ?? leadRecord.currentSituationSummary,
    keyIssues: leadRecord.keyIssues
      ? leadRecord.keyIssues
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    overviewSummary:
      reportRecord?.thisWeekTasks ??
      leadRecord.consultationMemo ??
      "아직 운영 메모가 없어요.",
    progressStatus:
      reportRecord?.nextAction ?? `${leadRecord.status} 상태로 관리 중이에요.`,
    guardianReport:
      reportRecord?.neededHelp ?? leadRecord.currentSituationSummary,
    reportRecord,
    consultations,
    notes,
    aiAnalysis: (input.lead as Record<string, unknown>).ai_analysis as RecordingAiAnalysis | null | undefined,
    aiAnalyzedAt: (input.lead as Record<string, unknown>).ai_analyzed_at as string | null | undefined,
  };
}
