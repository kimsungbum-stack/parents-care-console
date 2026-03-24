import { getAnthropicClient } from "../client";

export type ConsultationAnalysis = {
  guardianName: string | null;
  phone: string | null;
  relationship: string | null;
  careRecipientName: string | null;
  careRecipientAge: string | null;
  currentSituation: string;
  urgency: "높음" | "보통" | "낮음";
  coreNeeds: string;
  recommendedNextContactDate: string | null;
  recommendedAction: string;
  summary: string;
};

/**
 * 주민번호 패턴(6자리-7자리)과 상세주소(동/호/층)를 마스킹
 */
export function maskPersonalInfo(text: string): string {
  // 주민번호: 6자리-7자리 (예: 880101-1234567)
  let masked = text.replace(
    /\d{6}\s*-\s*\d{7}/g,
    "******-*******"
  );

  // 상세주소: 숫자+동, 숫자+호, 숫자+층 (예: 101동, 1502호, 3층)
  masked = masked.replace(/\d+동/g, "***동");
  masked = masked.replace(/\d+호/g, "***호");
  masked = masked.replace(/\d+층/g, "***층");

  return masked;
}

const SYSTEM_PROMPT = `당신은 장기요양기관(주간보호센터)의 상담 통화 내용을 분석하는 전문가입니다.
음성 통화를 텍스트로 변환한 내용을 받으면, 구조화된 정보를 추출하여 JSON으로 반환합니다.

반환 형식:
{
  "guardianName": "보호자 이름 (없으면 null)",
  "phone": "전화번호 (없으면 null)",
  "relationship": "보호자와 대상자의 관계 (예: 아들, 딸, 며느리, 없으면 null)",
  "careRecipientName": "케어 대상자 이름 (없으면 null)",
  "careRecipientAge": "대상자 나이/연령대 (예: '78세', '80대 초반', 없으면 null)",
  "currentSituation": "현재 상황 요약 (2-3문장)",
  "urgency": "높음 | 보통 | 낮음",
  "coreNeeds": "보호자의 핵심 니즈 요약 (1-2문장)",
  "recommendedNextContactDate": "다음 연락 권장일 (YYYY-MM-DD 형식, 판단 불가 시 null)",
  "recommendedAction": "센터에서 취해야 할 다음 행동 (1문장)",
  "summary": "전체 상담 내용 한 줄 요약"
}

규칙:
- 반드시 유효한 JSON만 반환하세요. 다른 텍스트는 포함하지 마세요.
- 긴급 입소, 낙상, 치매 악화, 독거 어르신, 응급 상황 등 긴급한 키워드가 있으면 urgency를 "높음"으로 설정하세요.
- recommendedNextContactDate는 상담 내용에서 약속 날짜를 추출하고, 없으면 긴급도에 따라 결정하세요:
  - 높음: 1일 후
  - 보통: 3일 후
  - 낮음: 7일 후
- 개인정보(주민번호, 상세주소)는 이미 마스킹 처리되어 있으므로 그대로 사용하세요.
- 통화 내용이 불완전하더라도 추출 가능한 정보는 최대한 채워주세요.`;

export async function analyzeConsultation(
  transcript: string
): Promise<ConsultationAnalysis> {
  if (!process.env.ANTHROPIC_API_KEY) {
    const { analyzeWithRegex } = await import("../demo-analysis");
    return analyzeWithRegex(transcript);
  }

  const client = getAnthropicClient();
  const maskedTranscript = maskPersonalInfo(transcript);

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `다음은 보호자 상담 통화를 텍스트로 변환한 내용입니다. 분석해주세요:\n\n${maskedTranscript}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("ANALYSIS_FAILED");
    }

    const parsed: ConsultationAnalysis = JSON.parse(textBlock.text);
    return parsed;
  } catch (error) {
    if (error instanceof Error && error.message === "ANALYSIS_FAILED") {
      throw error;
    }
    throw new Error("ANALYSIS_FAILED");
  }
}
