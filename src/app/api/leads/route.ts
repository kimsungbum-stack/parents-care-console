import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  normalizeNewLeadFormValues,
  type NewLeadFormValues,
} from "@/lib/forms/new-lead";
import { createLead } from "@/lib/mutations/create-lead";
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
