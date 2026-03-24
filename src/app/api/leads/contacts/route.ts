import { NextResponse } from "next/server";

import { createSupabasePlainClient } from "@/lib/supabase/plain";
import type { LeadRecord } from "@/types/domain";

type LeadRow = {
  id: string;
  guardian_name: string;
  phone: string;
  guardian_relationship: string | null;
  care_recipient_name: string | null;
  care_recipient_age_group: string | null;
  current_situation_summary: string;
  source: string;
  status: string;
  next_contact_date: string | null;
  key_issues: string | null;
  consultation_memo: string | null;
  hospital_name: string | null;
  department_info: string | null;
  examination_required: boolean | null;
  mobility_level: string | null;
  payment_assistance_required: boolean | null;
  transport_method: string | null;
  accompaniment_scope: string | null;
  is_high_risk: boolean;
  created_at: string;
  updated_at: string;
};

function toLeadRecord(row: LeadRow): LeadRecord {
  return {
    id: row.id,
    guardianName: row.guardian_name,
    phone: row.phone,
    guardianRelationship: row.guardian_relationship,
    careRecipientName: row.care_recipient_name,
    careRecipientAgeGroup: row.care_recipient_age_group,
    currentSituationSummary: row.current_situation_summary,
    source: row.source,
    status: row.status as LeadRecord["status"],
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

function getWeekEnd(today: Date): string {
  const day = today.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  const sunday = new Date(today);
  sunday.setDate(today.getDate() + daysUntilSunday);
  return sunday.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const supabase = createSupabasePlainClient();

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("next_contact_date", { ascending: true });

    if (error) {
      return NextResponse.json(
        { message: "연락 일정 데이터를 불러오지 못했습니다." },
        { status: 500 },
      );
    }

    const rows = (data ?? []) as LeadRow[];
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const weekEndStr = getWeekEnd(today);

    const overdue: LeadRecord[] = [];
    const todayList: LeadRecord[] = [];
    const thisWeek: LeadRecord[] = [];
    const noDate: LeadRecord[] = [];

    for (const row of rows) {
      const lead = toLeadRecord(row);
      const d = row.next_contact_date;

      if (d === null) {
        noDate.push(lead);
      } else if (d < todayStr) {
        overdue.push(lead);
      } else if (d === todayStr) {
        todayList.push(lead);
      } else if (d <= weekEndStr) {
        thisWeek.push(lead);
      }
    }

    return NextResponse.json({
      overdue,
      today: todayList,
      this_week: thisWeek,
      no_date: noDate,
      summary: {
        overdue: overdue.length,
        today: todayList.length,
        this_week: thisWeek.length,
        no_date: noDate.length,
      },
    });
  } catch {
    return NextResponse.json(
      { message: "연락 일정 조회 중 문제가 발생했습니다." },
      { status: 500 },
    );
  }
}
