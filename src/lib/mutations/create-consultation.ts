import "server-only";

import {
  type LeadConsultationErrors,
  type LeadConsultationPayload,
  validateLeadConsultationPayload,
} from "@/lib/forms/consultation";
import { mapConsultationRowToLeadConsultation } from "@/lib/mappers/lead-mappers";
import { createSupabasePlainClient } from "@/lib/supabase/plain";
import type { LeadConsultation } from "@/types/domain";

type CreateLeadConsultationResult =
  | {
      status: "success";
      consultation: LeadConsultation;
    }
  | {
      status: "validation_error";
      fieldErrors: LeadConsultationErrors;
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

export async function createLeadConsultation(
  values: LeadConsultationPayload,
): Promise<CreateLeadConsultationResult> {
  const fieldErrors = validateLeadConsultationPayload(values);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "validation_error",
      fieldErrors,
      message: "상담 기록 입력값을 다시 확인해 주세요.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message:
        "데이터 연결이 아직 완료되지 않아 상담 기록을 저장할 수 없습니다.",
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
          "상담 기록을 저장하기 전에 리드 정보를 확인하지 못했습니다.",
      };
    }

    if (!leadRow) {
      return {
        status: "not_found",
        message: "해당 리드를 찾을 수 없어 상담 기록을 저장하지 못했습니다.",
      };
    }

    const { data: consultationRow, error: consultationError } = await supabase
      .from("consultations")
      .insert({
        lead_id: values.leadId,
        consulted_at: values.consultedAt,
        channel: values.channel.trim(),
        summary: values.summary.trim(),
        details: values.details.trim() || null,
      })
      .select("*")
      .single();

    if (consultationError || !consultationRow) {
      return {
        status: "error",
        message:
          "상담 기록을 저장하지 못했습니다. 연결 상태를 확인해 주세요.",
      };
    }

    return {
      status: "success",
      consultation: mapConsultationRowToLeadConsultation(consultationRow),
    };
  } catch {
    return {
      status: "error",
      message:
        "상담 기록 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}
