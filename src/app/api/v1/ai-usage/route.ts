import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabasePlainClient } from "@/lib/supabase/plain";
import { PLAN_AI_LIMITS, type PlanTier } from "@/types/domain";

/**
 * GET /api/v1/ai-usage — AI 분석 사용량 조회
 * POST /api/v1/ai-usage — AI 분석 사용량 1 증가
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ allowed: false, reason: "not_authenticated" }, { status: 401 });
    }

    const supabase = createSupabasePlainClient();
    const { data: org } = await supabase
      .from("organizations")
      .select("plan, ai_analysis_count_this_month")
      .eq("id", currentUser.organizationId)
      .maybeSingle();

    if (!org) {
      return NextResponse.json({ allowed: false, reason: "no_org" });
    }

    const plan = org.plan as PlanTier;
    const used = org.ai_analysis_count_this_month;
    const limit = PLAN_AI_LIMITS[plan];
    const remaining = limit === Infinity ? null : Math.max(0, limit - used);

    return NextResponse.json({
      plan,
      used,
      limit: limit === Infinity ? null : limit,
      remaining,
      allowed: limit === Infinity || used < limit,
    });
  } catch {
    return NextResponse.json({ allowed: false, reason: "error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
    }

    const supabase = createSupabasePlainClient();
    const { data: org } = await supabase
      .from("organizations")
      .select("id, plan, ai_analysis_count_this_month")
      .eq("id", currentUser.organizationId)
      .maybeSingle();

    if (!org) {
      return NextResponse.json({ error: "조직 정보 없음" }, { status: 404 });
    }

    const plan = org.plan as PlanTier;
    const limit = PLAN_AI_LIMITS[plan];

    if (limit !== Infinity && org.ai_analysis_count_this_month >= limit) {
      return NextResponse.json(
        { error: "이번 달 AI 분석 횟수를 모두 사용했어요." },
        { status: 403 }
      );
    }

    await supabase
      .from("organizations")
      .update({ ai_analysis_count_this_month: org.ai_analysis_count_this_month + 1 })
      .eq("id", org.id);

    return NextResponse.json({
      used: org.ai_analysis_count_this_month + 1,
      limit: limit === Infinity ? null : limit,
    });
  } catch {
    return NextResponse.json({ error: "사용량 업데이트 실패" }, { status: 500 });
  }
}
