import { NextRequest, NextResponse } from "next/server";
import { analyzeConsultation } from "@/lib/ai/analyze-consultation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { consultationText } = body;

    if (!consultationText || typeof consultationText !== "string") {
      return NextResponse.json(
        { error: "consultationText는 필수 문자열입니다." },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const result = await analyzeConsultation({ consultationText });
    return NextResponse.json(result);
  } catch (error) {
    console.error("상담 분석 오류:", error);
    return NextResponse.json(
      { error: "상담 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
