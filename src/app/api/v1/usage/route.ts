import { NextResponse } from "next/server";

import { getOrgUsage } from "@/lib/usage";

export async function GET() {
  try {
    const usage = await getOrgUsage();

    if (!usage) {
      return NextResponse.json(
        { message: "조직 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json(usage);
  } catch {
    return NextResponse.json(
      { message: "사용량 조회 중 문제가 발생했습니다." },
      { status: 500 },
    );
  }
}
