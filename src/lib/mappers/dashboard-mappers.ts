import {
  LEAD_STATUS_ORDER,
  type DashboardStatusSummaryItem,
  type RecentConsultationItem,
  type UpcomingContactItem,
} from "@/types/domain";
import type { Database } from "@/types/supabase";

type LeadDashboardRow = Pick<
  Database["public"]["Tables"]["leads"]["Row"],
  | "id"
  | "guardian_name"
  | "status"
  | "next_contact_date"
  | "current_situation_summary"
  | "consultation_memo"
>;

type ConsultationDashboardRow = Pick<
  Database["public"]["Tables"]["consultations"]["Row"],
  "id" | "lead_id" | "channel" | "consulted_at" | "summary"
>;

function formatDateLabel(value: string | null) {
  return value ? value.slice(0, 10) : "-";
}

function formatDateTimeLabel(value: string) {
  return value.replace("T", " ").slice(0, 16);
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

export function createEmptyDashboardStatusSummary(): DashboardStatusSummaryItem[] {
  return LEAD_STATUS_ORDER.map((label) => ({
    label,
    count: 0,
  }));
}

export function mapLeadRowsToDashboardStatusSummary(
  rows: LeadDashboardRow[],
): DashboardStatusSummaryItem[] {
  const counts = new Map<DashboardStatusSummaryItem["label"], number>();

  LEAD_STATUS_ORDER.forEach((status) => {
    counts.set(status, 0);
  });

  rows.forEach((row) => {
    counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
  });

  return LEAD_STATUS_ORDER.map((label) => ({
    label,
    count: counts.get(label) ?? 0,
  }));
}

export function mapLeadRowToUpcomingContactItem(
  row: LeadDashboardRow,
): UpcomingContactItem {
  return {
    id: row.id,
    guardianName: row.guardian_name,
    scheduledDate: formatDateLabel(row.next_contact_date),
    note: truncate(
      row.consultation_memo ?? row.current_situation_summary,
      52,
    ),
  };
}

export function mapConsultationRowToRecentConsultationItem(
  row: ConsultationDashboardRow,
  guardianName?: string,
): RecentConsultationItem {
  return {
    id: row.id,
    guardianName: guardianName ?? "이름 미상",
    channel: row.channel ?? "미지정",
    recordedAt: formatDateTimeLabel(row.consulted_at),
    summary: row.summary,
  };
}
