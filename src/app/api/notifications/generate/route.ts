import { NextResponse } from "next/server";
import { createSupabasePlainClient } from "@/lib/supabase/plain";

/**
 * POST /api/notifications/generate
 * 알림 자동 생성 (cron 또는 대시보드 로드 시 호출)
 * - 오늘 연락 예정인 케이스 → contact_due
 * - 3일 이상 미연락 신규 케이스 → stale_lead
 */
export async function POST() {
  try {
    const supabase = createSupabasePlainClient();
    const today = new Date().toISOString().slice(0, 10);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // 조직 ID 가져오기
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .limit(1)
      .single();

    if (!org) {
      return NextResponse.json({ generated: 0 });
    }

    const orgId = org.id;

    // 오늘 이미 생성된 알림 확인 (중복 방지)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { data: existingToday } = await supabase
      .from("notifications")
      .select("lead_id, type")
      .eq("organization_id", orgId)
      .gte("created_at", todayStart.toISOString());

    const existingSet = new Set(
      (existingToday ?? []).map((n) => `${n.lead_id}:${n.type}`)
    );

    const notifications: {
      organization_id: string;
      lead_id: string;
      type: "contact_due" | "stale_lead";
      title: string;
      body: string;
    }[] = [];

    // 1. 오늘 연락 예정
    const { data: dueLeads } = await supabase
      .from("leads")
      .select("id, guardian_name, next_contact_date")
      .lte("next_contact_date", today)
      .not("status", "eq", "보류");

    for (const lead of dueLeads ?? []) {
      if (existingSet.has(`${lead.id}:contact_due`)) continue;
      const isOverdue = lead.next_contact_date! < today;
      notifications.push({
        organization_id: orgId,
        lead_id: lead.id,
        type: "contact_due",
        title: isOverdue
          ? `${lead.guardian_name} 보호자님 연락 기한이 지났어요`
          : `오늘 ${lead.guardian_name} 보호자님께 연락할 날이에요`,
        body: isOverdue
          ? `예정일: ${lead.next_contact_date}. 빠른 연락이 필요해요.`
          : "케이스를 눌러 상담 기록을 남겨보세요.",
      });
    }

    // 2. 3일 경과 신규 미연락
    const { data: staleLeads } = await supabase
      .from("leads")
      .select("id, guardian_name, created_at")
      .eq("status", "신규")
      .lte("created_at", `${threeDaysAgo}T23:59:59`);

    // 상담 기록이 있는 리드는 제외
    const staleIds = (staleLeads ?? []).map((l) => l.id);
    let leadsWithConsultation = new Set<string>();
    if (staleIds.length > 0) {
      const { data: consulted } = await supabase
        .from("consultations")
        .select("lead_id")
        .in("lead_id", staleIds);
      leadsWithConsultation = new Set((consulted ?? []).map((c) => c.lead_id));
    }

    for (const lead of staleLeads ?? []) {
      if (existingSet.has(`${lead.id}:stale_lead`)) continue;
      if (leadsWithConsultation.has(lead.id)) continue;
      notifications.push({
        organization_id: orgId,
        lead_id: lead.id,
        type: "stale_lead",
        title: `${lead.guardian_name} 보호자님이 3일 전 문의했어요`,
        body: "아직 연락이 없어요. 연락해보시겠어요?",
      });
    }

    // 최대 5건까지만 생성 (알림 폭탄 방지)
    const toInsert = notifications.slice(0, 5);

    if (toInsert.length > 0) {
      await supabase.from("notifications").insert(toInsert);
    }

    return NextResponse.json({ generated: toInsert.length });
  } catch (error) {
    console.error("알림 생성 오류:", error);
    return NextResponse.json({ error: "알림 생성 실패" }, { status: 500 });
  }
}
