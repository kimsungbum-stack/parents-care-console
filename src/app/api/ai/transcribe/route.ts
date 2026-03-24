import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/ai/whisper";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recordingUrl } = body;

    if (!recordingUrl || typeof recordingUrl !== "string") {
      return NextResponse.json(
        { error: "recordingUrl은 필수 문자열입니다." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "음성 변환 서비스가 아직 설정되지 않았습니다. 관리자에게 문의해 주세요." },
        { status: 500 }
      );
    }

    const response = await fetch(recordingUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: "녹음 파일을 다운로드할 수 없습니다." },
        { status: 400 }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = response.headers.get("content-type") || "audio/mpeg";

    const transcript = await transcribeAudio(buffer, mimeType);

    return NextResponse.json({ transcript });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "TRANSCRIPTION_FAILED";

    if (message === "RECORDING_TOO_SHORT") {
      return NextResponse.json(
        { error: "녹음이 너무 짧습니다. 5초 이상의 녹음이 필요합니다." },
        { status: 400 }
      );
    }

    console.error("음성 변환 오류:", error);
    return NextResponse.json(
      { error: "음성을 텍스트로 변환하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
