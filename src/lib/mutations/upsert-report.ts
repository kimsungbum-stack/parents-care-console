import "server-only";

import {
  type LeadReportErrors,
  type LeadReportPayload,
  validateLeadReportPayload,
} from "@/lib/forms/report";
import { mapReportRowToGuardianReportRecord } from "@/lib/mappers/lead-mappers";
import { createSupabasePlainClient } from "@/lib/supabase/plain";
import type { GuardianReportRecord } from "@/types/domain";

type UpsertLeadReportResult =
  | {
      status: "success";
      report: GuardianReportRecord;
    }
  | {
      status: "validation_error";
      fieldErrors: LeadReportErrors;
      message: string;
    }
  | {
      status: "not_found";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function upsertLeadReport(
  values: LeadReportPayload,
): Promise<UpsertLeadReportResult> {
  const fieldErrors = validateLeadReportPayload(values);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "validation_error",
      fieldErrors,
      message: "리포트 입력값을 다시 확인해 주세요.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message:
        "데이터 연결이 아직 완료되지 않아 리포트를 저장할 수 없어요.",
    };
  }

  try {
    const supabase = createSupabasePlainClient();
    const { data: leadRow, error: leadError } = await supabase
      .from("leads")
      .select("id")
      .eq("id", values.leadId)
      .maybeSingle();

    if (leadError) {
      return {
        status: "error",
        message:
          "리포트를 저장하기 전에 케이스 정보를 확인하지 못했어요.",
      };
    }

    if (!leadRow) {
      return {
        status: "not_found",
        message: "해당 케이스를 찾을 수 없어 리포트를 저장하지 못했어요.",
      };
    }

    const { data: reportRow, error: reportError } = await supabase
      .from("reports")
      .upsert(
        {
          lead_id: values.leadId,
          current_situation: values.report.currentSituation,
          this_week_tasks: values.report.thisWeekTasks,
          hospital_schedule: values.report.hospitalSchedule,
          needed_help: values.report.neededHelp,
          next_action: values.report.nextAction,
        },
        {
          onConflict: "lead_id",
        },
      )
      .select("*")
      .single();

    if (reportError || !reportRow) {
      return {
        status: "error",
        message:
          "리포트를 저장하지 못했어요. 연결 상태를 확인해 주세요.",
      };
    }

    return {
      status: "success",
      report: mapReportRowToGuardianReportRecord(reportRow),
    };
  } catch {
    return {
      status: "error",
      message:
        "리포트 저장 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.",
    };
  }
}
