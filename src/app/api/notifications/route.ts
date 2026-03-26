import { NextRequest, NextResponse } from "next/server";
import { createSupabasePlainClient } from "@/lib/supabase/plain";

/**
 * GET /api/notifications — 알림 목록 (최근 20건)
 * PATCH /api/notifications — 알림 읽음 처리
 */
export async function GET() {
  try {
    const supabase = createSupabasePlainClient();

    const { data, error } = await supabase
      .from("notifications")
      .select("id, lead_id, type, title, body, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const notifications = (data ?? []).map((n) => ({
      id: n.id,
      leadId: n.lead_id,
      type: n.type,
      title: n.title,
      body: n.body,
      isRead: n.is_read,
      createdAt: n.created_at,
    }));

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createSupabasePlainClient();

    if (body.markAllRead) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false);
    } else if (body.notificationId) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", body.notificationId);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "읽음 처리 실패" }, { status: 500 });
  }
}
