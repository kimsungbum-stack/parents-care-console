import { NextResponse } from "next/server";

import { normalizeLeadNotePayload } from "@/lib/forms/note";
import { createLeadNote } from "@/lib/mutations/create-note";

type RouteContext = {
  params: Promise<{
    leadId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
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
  const values = normalizeLeadNotePayload({
    leadId,
    noteType: payload.noteType,
    content: payload.content,
  });
  const result = await createLeadNote(values);

  if (result.status === "success") {
    return NextResponse.json(
      {
        note: result.note,
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
