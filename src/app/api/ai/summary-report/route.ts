import { NextRequest, NextResponse } from "next/server";
import { generateSummaryReport } from "@/lib/ai/generate-summary-report";
import type { SummaryReportInput } from "@/types/domain";

export async function POST(request: NextRequest) {
  try {
    const body: SummaryReportInput = await request.json();

    if (!body.guardianName || !body.currentSituationSummary) {
      return NextResponse.json(
        { error: "guardianName과 currentSituationSummary는 필수입니다." },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const result = await generateSummaryReport(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("요약 리포트 생성 오류:", error);
    return NextResponse.json(
      { error: "요약 리포트 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
