import "server-only";

import type { NewLeadFormErrors, NewLeadFormValues } from "@/lib/forms/new-lead";
import { validateNewLeadFormValues } from "@/lib/forms/new-lead";
import { mapNewLeadFormValuesToLeadInsert } from "@/lib/mappers/new-lead-mappers";
import { createSupabasePlainClient } from "@/lib/supabase/plain";

type CreateLeadResult =
  | {
      status: "success";
      leadId: string;
    }
  | {
      status: "validation_error";
      fieldErrors: NewLeadFormErrors;
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

export async function createLead(
  values: NewLeadFormValues,
): Promise<CreateLeadResult> {
  const fieldErrors = validateNewLeadFormValues(values);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "validation_error",
      fieldErrors,
      message: "필수 입력값을 확인해 주세요.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message: "데이터 연결이 아직 완료되지 않아 케이스를 저장할 수 없어요.",
    };
  }

  try {
    const supabase = createSupabasePlainClient();
    const { data, error } = await supabase
      .from("leads")
      .insert(mapNewLeadFormValuesToLeadInsert(values))
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return {
        status: "error",
        message: "케이스를 저장하지 못했어요. 연결 상태를 다시 확인해 주세요.",
      };
    }

    if (!data) {
      return {
        status: "error",
        message: "케이스를 저장하지 못했어요. 연결 상태를 다시 확인해 주세요.",
      };
    }

    return {
      status: "success",
      leadId: data.id,
    };
  } catch (err) {
    console.error("Lead creation exception:", err);
    return {
      status: "error",
      message: "저장 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.",
    };
  }
}
