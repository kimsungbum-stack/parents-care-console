import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/ai/client";
import {
  ANALYZE_CONSULTATION_SYSTEM_PROMPT,
  buildUserPrompt,
} from "@/lib/ai/prompts/analyze-consultation";
import type { ConsultationAnalysis } from "@/types/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "text는 필수 문자열입니다." },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const client = getAnthropicClient();

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: ANALYZE_CONSULTATION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildUserPrompt(text),
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "AI 응답에서 텍스트를 받지 못했습니다." },
        { status: 500 }
      );
    }

    const analysis: ConsultationAnalysis = JSON.parse(textBlock.text);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("AI 상담 분석 오류:", error);
    return NextResponse.json(
      { error: "상담 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
