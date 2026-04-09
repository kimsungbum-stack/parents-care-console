import { getAnthropicClient } from "./client";
import type {
  ConsultationAnalysisInput,
  ConsultationAnalysis,
} from "@/types/domain";

const SYSTEM_PROMPT = `당신은 장기요양기관(주간보호센터)의 상담 내용을 분석하는 전문가입니다.
상담 텍스트를 받으면 다음 정보를 정확하게 추출하여 JSON으로 반환합니다.

반환 형식:
{
  "guardianName": "보호자 이름 (텍스트에서 추출, 없으면 '미확인')",
  "careTarget": "케어 대상자 이름 (없으면 null)",
  "careTargetRelationship": "보호자와 케어 대상자의 관계 (예: 어머니, 아버지, 할머니 등, 없으면 null)",
  "situationSummary": "현재 상황 요약 (2-3문장)",
  "keyIssues": ["핵심 이슈 목록"],
  "urgencyLevel": "높음 | 보통 | 낮음"
}

규칙:
- 반드시 유효한 JSON만 반환하세요. 다른 텍스트는 포함하지 마세요.
- 이름이 명시되지 않은 경우 guardianName은 "미확인"으로 설정하세요.
- 긴급 입소, 낙상, 치매 악화 등 긴급한 키워드가 있으면 urgencyLevel을 "높음"으로 설정하세요.
- situationSummary는 간결하되 핵심 정보를 포함하세요.`;

export async function analyzeConsultation(
  input: ConsultationAnalysisInput
): Promise<ConsultationAnalysis> {
  const client = getAnthropicClient();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `다음 상담 내용을 분석해주세요:\n\n${input.consultationText}`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude API에서 텍스트 응답을 받지 못했습니다.");
  }

  const parsed: ConsultationAnalysis = JSON.parse(textBlock.text);
  return parsed;
}
