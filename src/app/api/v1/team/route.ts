import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabasePlainClient } from "@/lib/supabase/plain";

/**
 * GET /api/v1/team — 팀원 목록 + 초대 목록
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
    }

    const orgId = currentUser.organizationId;
    const supabase = createSupabasePlainClient();

    // 팀원 목록
    const { data: members } = await supabase
      .from("users")
      .select("id, email, role, created_at")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: true });

    // 대기 중 초대
    const { data: invitations } = await supabase
      .from("invitations")
      .select("id, email, role, status, created_at")
      .eq("organization_id", orgId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    return NextResponse.json({
      members: (members ?? []).map((m) => ({
        id: m.id,
        email: m.email,
        role: m.role,
        createdAt: m.created_at,
      })),
      invitations: (invitations ?? []).map((i) => ({
        id: i.id,
        email: i.email,
        role: i.role,
        status: i.status,
        createdAt: i.created_at,
      })),
    });
  } catch {
    return NextResponse.json({ members: [], invitations: [] });
  }
}

/**
 * POST /api/v1/team — 팀원 초대
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
    }
    if (currentUser.role !== "admin") {
      return NextResponse.json({ error: "관리자만 팀원을 초대할 수 있어요." }, { status: 403 });
    }

    const body = await request.json();
    const { email, role = "member" } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "올바른 이메일을 입력해주세요." },
        { status: 400 }
      );
    }

    if (!["admin", "member"].includes(role)) {
      return NextResponse.json(
        { error: "유효하지 않은 역할입니다." },
        { status: 400 }
      );
    }

    const orgId = currentUser.organizationId;
    const supabase = createSupabasePlainClient();

    // 이미 팀원인지 확인
    const { data: existingMember } = await supabase
      .from("users")
      .select("id")
      .eq("organization_id", orgId)
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json(
        { error: "이미 팀원으로 등록된 이메일이에요." },
        { status: 409 }
      );
    }

    // 이미 초대된 이메일인지 확인
    const { data: existingInvite } = await supabase
      .from("invitations")
      .select("id")
      .eq("organization_id", orgId)
      .eq("email", email.toLowerCase())
      .eq("status", "pending")
      .maybeSingle();

    if (existingInvite) {
      return NextResponse.json(
        { error: "이미 초대가 발송된 이메일이에요." },
        { status: 409 }
      );
    }

    const { error } = await supabase.from("invitations").insert({
      organization_id: orgId,
      email: email.toLowerCase(),
      role,
    });

    if (error) {
      console.error("초대 생성 오류:", error);
      return NextResponse.json(
        { error: "초대 생성에 실패했어요." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "초대 처리 중 문제가 발생했어요." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/team — 초대 취소
 */
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
    }
    if (currentUser.role !== "admin") {
      return NextResponse.json({ error: "관리자만 초대를 취소할 수 있어요." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get("invitationId");

    if (!invitationId) {
      return NextResponse.json(
        { error: "초대 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = createSupabasePlainClient();
    await supabase
      .from("invitations")
      .delete()
      .eq("id", invitationId)
      .eq("organization_id", currentUser.organizationId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "초대 취소 실패" },
      { status: 500 }
    );
  }
}
