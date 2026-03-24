import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  normalizeNewLeadFormValues,
  type NewLeadFormValues,
} from "@/lib/forms/new-lead";
import { createLead } from "@/lib/mutations/create-lead";

export async function POST(request: Request) {
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
