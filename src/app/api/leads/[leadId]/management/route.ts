import { NextResponse } from "next/server";

import { normalizeLeadManagementPayload } from "@/lib/forms/lead-management";
import { updateLeadManagement } from "@/lib/mutations/update-lead-management";
import { createSupabasePlainClient } from "@/lib/supabase/plain";

type RouteContext = {
  params: Promise<{
    leadId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      {
        message: "잘못된 요청입니다. 입력값을 다시 확인해 주세요.",
      },
      { status: 400 },
    );
  }

  const { leadId } = await context.params;
  const values = normalizeLeadManagementPayload({
    leadId,
    status: payload.status,
    nextContactDate: payload.nextContactDate,
  });
  const result = await updateLeadManagement(values);

  if (result.status === "success") {
    return NextResponse.json(
      {
        leadId: result.leadId,
        status: result.leadStatus,
        nextContactDate: result.nextContactDate,
      },
      { status: 200 },
    );
  }

  if (result.status === "validation_error") {
    return NextResponse.json(
      {
        message: result.message,
        fieldErrors: result.fieldErrors,
      },
      { status: 400 },
    );
  }

  if (result.status === "not_found") {
    return NextResponse.json(
      {
        message: result.message,
      },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      message: result.message,
    },
    { status: 500 },
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { leadId } = await context.params;

  if (!leadId) {
    return NextResponse.json({ message: "케이스 ID가 필요합니다." }, { status: 400 });
  }

  try {
    const supabase = createSupabasePlainClient();

    // 관련 데이터 먼저 삭제 (FK 제약 대응)
    await supabase.from("consultations").delete().eq("lead_id", leadId);
    await supabase.from("notes").delete().eq("lead_id", leadId);
    await supabase.from("reports").delete().eq("lead_id", leadId);

    const { error } = await supabase.from("leads").delete().eq("id", leadId);

    if (error) {
      return NextResponse.json({ message: "케이스 삭제 중 문제가 발생했어요." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "케이스 삭제 중 문제가 발생했어요." }, { status: 500 });
  }
}
