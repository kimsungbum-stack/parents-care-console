import { NextRequest, NextResponse } from "next/server";
import { createSupabasePlainClient } from "@/lib/supabase/plain";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "파일이 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = createSupabasePlainClient();
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `recordings/${timestamp}_${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("recordings")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("녹음 파일 업로드 오류:", uploadError);
      return NextResponse.json(
        { error: "파일 업로드에 실패했습니다." },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from("recordings")
      .getPublicUrl(filePath);

    return NextResponse.json({
      recordingUrl: urlData.publicUrl,
      fileName: file.name,
    });
  } catch (error) {
    console.error("녹음 업로드 오류:", error);
    return NextResponse.json(
      { error: "파일 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
