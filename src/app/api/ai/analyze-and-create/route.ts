import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { analyzeConsultation } from "@/lib/ai/prompts/consultation-analysis";
import { createSupabasePlainClient } from "@/lib/supabase/plain";
import type { Json } from "@/types/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, recordingUrl, mode, editedAnalysis } = body;

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "transcript는 필수 문자열입니다." },
        { status: 400 }
      );
    }

    const safeRecordingUrl =
      recordingUrl && typeof recordingUrl === "string" ? recordingUrl : null;

    // Step 1: 분석만 수행 (미리보기 모드)
    if (mode === "analyze-only") {
      const analysis = await analyzeConsultation(transcript);
      return NextResponse.json({ analysis });
    }

    // Step 2: 미리보기에서 확정 → 케이스 생성 (editedAnalysis가 있으면 사용)
    const analysis = editedAnalysis ?? await analyzeConsultation(transcript);

    const supabase = createSupabasePlainClient();
    const { data, error } = await supabase
      .from("leads")
      .insert({
        guardian_name: analysis.guardianName || "미확인 보호자",
        phone: analysis.phone || "",
        status: "신규" as const,
        current_situation_summary: analysis.summary,
        source: "AI 녹음 분석",
        recording_url: safeRecordingUrl,
        transcript,
        ai_analysis: JSON.parse(JSON.stringify(analysis)) as Json,
        ai_analyzed_at: new Date().toISOString(),
        next_contact_date: analysis.recommendedNextContactDate || null,
        is_high_risk: analysis.urgency === "높음",
      })
      .select("id")
      .single();

    if (error) {
      console.error("리드 생성 오류:", error);
      return NextResponse.json(
        { error: "분석 결과를 저장하지 못했어요." },
        { status: 500 }
      );
    }

    revalidatePath("/");
    revalidatePath("/leads");

    return NextResponse.json({
      leadId: data.id,
      analysis,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ANALYSIS_FAILED";

    if (message === "ANALYSIS_FAILED") {
      return NextResponse.json(
        { error: "AI 상담 분석에 실패했습니다. 다시 시도해 주세요." },
        { status: 500 }
      );
    }

    console.error("분석 및 케이스 생성 오류:", error);
    return NextResponse.json(
      { error: "분석 및 케이스 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
