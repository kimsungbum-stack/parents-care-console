import { NextResponse } from "next/server";

import { normalizeLeadReportPayload } from "@/lib/forms/report";
import { upsertLeadReport } from "@/lib/mutations/upsert-report";

type RouteContext = {
  params: Promise<{
    leadId: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
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
  const values = normalizeLeadReportPayload({
    leadId,
    report: payload,
  });
  const result = await upsertLeadReport(values);

  if (result.status === "success") {
    return NextResponse.json(
      {
        report: result.report,
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
