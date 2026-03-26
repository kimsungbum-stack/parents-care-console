import { NextResponse } from "next/server";
import { createSupabasePlainClient } from "@/lib/supabase/plain";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/accept-invite
 * 로그인 후 호출 — 대기 중 초대가 있으면 자동 수락
 */
export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ joined: false });
    }

    const plain = createSupabasePlainClient();

    // 대기 중인 초대 확인
    const { data: invitation } = await plain
      .from("invitations")
      .select("id, organization_id, role")
      .eq("email", user.email.toLowerCase())
      .eq("status", "pending")
      .limit(1)
      .single();

    if (!invitation) {
      return NextResponse.json({ joined: false });
    }

    // 이미 해당 조직 멤버인지 확인
    const { data: existingUser } = await plain
      .from("users")
      .select("id")
      .eq("id", user.id)
      .eq("organization_id", invitation.organization_id)
      .limit(1)
      .single();

    if (!existingUser) {
      // 사용자를 조직에 추가
      await plain.from("users").upsert({
        id: user.id,
        organization_id: invitation.organization_id,
        role: invitation.role,
        email: user.email.toLowerCase(),
      });
    }

    // 초대 상태 업데이트
    await plain
      .from("invitations")
      .update({ status: "accepted" })
      .eq("id", invitation.id);

    return NextResponse.json({
      joined: true,
      organizationId: invitation.organization_id,
      role: invitation.role,
    });
  } catch (error) {
    console.error("초대 수락 오류:", error);
    return NextResponse.json({ joined: false });
  }
}
