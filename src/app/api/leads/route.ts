import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import {
  normalizeNewLeadFormValues,
  type NewLeadFormValues,
} from "@/lib/forms/new-lead";
import { createLead } from "@/lib/mutations/create-lead";
import { createSupabasePlainClient } from "@/lib/supabase/plain";
import { getOrgUsage, incrementLeadCount } from "@/lib/usage";

export async function POST(request: Request) {
  // 무료 플랜 한도 체크
  const usage = await getOrgUsage();
  if (usage?.isAtLimit) {
    return NextResponse.json(
      {
        error:
          "이번 달 무료 등록 한도를 초과했어요. 스탠다드로 업그레이드하면 무제한으로 등록할 수 있어요.",
        code: "LIMIT_EXCEEDED",
      },
      { status: 429 },
    );
  }

  let payload: Partial<Record<keyof NewLeadFormValues, unknown>>;

  try {
    payload = (await request.json()) as Partial<
      Record<keyof NewLeadFormValues, unknown>
    >;
  } catch {
    return NextResponse.json(
      {
        message: "잘못된 요청입니다. 입력값을 다시 확인해 주세요.",
      },
      { status: 400 },
    );
  }

  const values = normalizeNewLeadFormValues(payload);
  const result = await createLead(values);

  if (result.status === "success") {
    await incrementLeadCount();
    revalidatePath("/");
    revalidatePath("/leads");
    return NextResponse.json(
      {
        leadId: result.leadId,
      },
      { status: 201 },
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

  return NextResponse.json(
    {
      message: result.message,
    },
    { status: 500 },
  );
}

export async function DELETE() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "로그인이 필요해요." }, { status: 401 });
    }
    if (currentUser.role !== "admin") {
      return NextResponse.json(
        { message: "관리자만 전체 케이스를 삭제할 수 있어요." },
        { status: 403 },
      );
    }

    const orgId = currentUser.organizationId;
    const supabase = createSupabasePlainClient();

    // 우리 조직 리드 ID만 추출 → 관련 테이블도 그 범위로만 삭제
    const { data: leadRows, error: leadsError } = await supabase
      .from("leads")
      .select("id")
      .eq("organization_id", orgId);

    if (leadsError) {
      return NextResponse.json(
        { message: "케이스 목록을 불러오지 못했어요." },
        { status: 500 },
      );
    }

    const leadIds = (leadRows ?? []).map((l) => l.id);

    if (leadIds.length > 0) {
      await supabase.from("consultations").delete().in("lead_id", leadIds);
      await supabase.from("notes").delete().in("lead_id", leadIds);
      await supabase.from("reports").delete().in("lead_id", leadIds);
    }

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("organization_id", orgId);

    if (error) {
      return NextResponse.json(
        { message: "케이스 삭제 중 문제가 발생했어요." },
        { status: 500 },
      );
    }

    revalidatePath("/");
    revalidatePath("/leads");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "케이스 삭제 중 문제가 발생했어요." },
      { status: 500 },
    );
  }
}
