import "server-only";

import type { NewLeadFormErrors, NewLeadFormValues } from "@/lib/forms/new-lead";
import { validateNewLeadFormValues } from "@/lib/forms/new-lead";
import { mapNewLeadFormValuesToLeadInsert } from "@/lib/mappers/new-lead-mappers";
import { createSupabasePlainClient } from "@/lib/supabase/plain";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      status: "error",
      message: `[AUTH-1] 인증 세션 없음: ${authError?.message ?? "user is null"}. 다시 로그인해 주세요.`,
    };
  }

  const plain = createSupabasePlainClient();
  const { data: userRow, error: userQueryError } = await plain
    .from("users")
    .select("organization_id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (userQueryError) {
    return {
      status: "error",
      message: `[AUTH-2] users 조회 실패: [${userQueryError.code ?? "?"}] ${userQueryError.message} (uid=${user.id.slice(0, 8)})`,
    };
  }

  if (!userRow) {
    return {
      status: "error",
      message: `[AUTH-3] public.users에 매핑 없음. uid=${user.id.slice(0, 8)} → SQL로 매핑 추가 필요`,
    };
  }

  if (!userRow.organization_id) {
    return {
      status: "error",
      message: `[AUTH-4] users.organization_id가 비어있음. uid=${user.id.slice(0, 8)}`,
    };
  }

  try {
    const { data, error } = await supabase
      .from("leads")
      .insert(mapNewLeadFormValuesToLeadInsert(values, userRow.organization_id))
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return {
        status: "error",
        message: `케이스를 저장하지 못했어요. [${error.code ?? "?"}] ${error.message}`,
      };
    }

    if (!data) {
      return {
        status: "error",
        message: "케이스를 저장하지 못했어요. 응답 데이터가 비어있어요.",
      };
    }

    return {
      status: "success",
      leadId: data.id,
    };
  } catch (err) {
    console.error("Lead creation exception:", err);
    const detail = err instanceof Error ? err.message : "알 수 없는 오류";
    return {
      status: "error",
      message: `저장 중 문제가 발생했어요. ${detail}`,
    };
  }
}
