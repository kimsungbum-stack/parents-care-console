import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabasePlainClient } from "@/lib/supabase/plain";

/**
 * PATCH /api/v1/settings — 기관명 변경 또는 프로필 업데이트
 */
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
    }

    const body = await request.json();
    const { orgName, userName, userPhone } = body;

    // 기관명 변경
    if (typeof orgName === "string") {
      if (currentUser.role !== "admin") {
        return NextResponse.json(
          { error: "관리자만 기관명을 변경할 수 있어요." },
          { status: 403 }
        );
      }

      const trimmed = orgName.trim();
      if (!trimmed) {
        return NextResponse.json(
          { error: "기관명을 입력해주세요." },
          { status: 400 }
        );
      }

      const supabase = createSupabasePlainClient();
      const { error } = await supabase
        .from("organizations")
        .update({ name: trimmed })
        .eq("id", currentUser.organizationId);

      if (error) {
        console.error("기관명 변경 오류:", error);
        return NextResponse.json(
          { error: "기관명 변경에 실패했어요." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, orgName: trimmed });
    }

    // 프로필 업데이트 (이름, 전화번호)
    if (typeof userName === "string" || typeof userPhone === "string") {
      const supabase = await createSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json(
          { error: "로그인 정보를 확인할 수 없어요." },
          { status: 401 }
        );
      }

      const metadata: Record<string, string> = {};
      if (typeof userName === "string") metadata.full_name = userName.trim();
      if (typeof userPhone === "string") metadata.phone = userPhone.trim();

      const { error } = await supabase.auth.updateUser({
        data: metadata,
      });

      if (error) {
        console.error("프로필 업데이트 오류:", error);
        return NextResponse.json(
          { error: "프로필 업데이트에 실패했어요." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "변경할 항목이 없어요." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "설정 변경 중 문제가 발생했어요." },
      { status: 500 }
    );
  }
}
