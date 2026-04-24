import "server-only";

import { getCurrentUser } from "@/lib/auth";
import {
  parseLeadStatus,
  type LeadManagementErrors,
  type LeadManagementPayload,
  validateLeadManagementPayload,
} from "@/lib/forms/lead-management";
import { createSupabasePlainClient } from "@/lib/supabase/plain";
import type { LeadStatus } from "@/types/domain";

type UpdateLeadManagementResult =
  | {
      status: "success";
      leadId: string;
      leadStatus: LeadStatus;
      nextContactDate: string | null;
    }
  | {
      status: "validation_error";
      fieldErrors: LeadManagementErrors;
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

export async function updateLeadManagement(
  values: LeadManagementPayload,
): Promise<UpdateLeadManagementResult> {
  const fieldErrors = validateLeadManagementPayload(values);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "validation_error",
      fieldErrors,
      message: "상태 또는 다음 연락일 입력값을 다시 확인해 주세요.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message:
        "데이터 연결이 아직 완료되지 않아 상태를 저장할 수 없어요.",
    };
  }

  const parsedStatus = parseLeadStatus(values.status);

  if (!parsedStatus) {
    return {
      status: "validation_error",
      fieldErrors: {
        status: "유효한 상태값을 선택해 주세요.",
      },
      message: "상태 입력값을 다시 확인해 주세요.",
    };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return {
      status: "error",
      message: "로그인이 필요해요.",
    };
  }

  try {
    const supabase = createSupabasePlainClient();
    const { data, error } = await supabase
      .from("leads")
      .update({
        status: parsedStatus,
        next_contact_date: values.nextContactDate || null,
      })
      .eq("id", values.leadId)
      .eq("organization_id", currentUser.organizationId)
      .select("id, status, next_contact_date")
      .maybeSingle();

    if (error) {
      return {
        status: "error",
        message:
          "상태 변경 내용을 저장하지 못했어요. 연결 상태를 확인해 주세요.",
      };
    }

    if (!data) {
      return {
        status: "not_found",
        message: "해당 케이스를 찾을 수 없어 저장하지 못했어요.",
      };
    }

    return {
      status: "success",
      leadId: data.id,
      leadStatus: data.status,
      nextContactDate: data.next_contact_date,
    };
  } catch {
    return {
      status: "error",
      message:
        "상태 저장 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.",
    };
  }
}
