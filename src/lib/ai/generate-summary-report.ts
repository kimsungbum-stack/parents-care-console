import { getAnthropicClient } from "./client";
import type { SummaryReportInput, SummaryReportResult } from "@/types/domain";

const SYSTEM_PROMPT = `당신은 장기요양기관(주간보호센터)의 케이스 요약 리포트를 작성하는 전문가입니다.
보호자 정보와 상담 기록을 받으면, 구조화된 요약 리포트를 생성합니다.

반환 형식 (JSON):
{
  "overallStatus": "전체 상황 요약 (1-2문장)",
  "progressTimeline": "상담 흐름 요약 (시간순으로 주요 변화 정리)",
  "currentNeeds": ["현재 필요한 서비스/지원 목록"],
  "recommendedActions": ["권장 후속 조치 목록"],
  "riskFactors": ["주의해야 할 위험 요소 (없으면 빈 배열)"],
  "reportMarkdown": "전체 리포트 (마크다운 형식)"
}

규칙:
- 반드시 유효한 JSON만 반환하세요.
- reportMarkdown은 보호자에게 공유할 수 있는 수준의 정리된 리포트여야 합니다.
- reportMarkdown 구조: ## 케어 현황 요약, ## 상담 경과, ## 현재 필요사항, ## 권장 조치, ## 주의사항
- 상담 기록이 없으면 현재 상황 정보만으로 리포트를 작성하세요.
- 전문 용어는 보호자가 이해할 수 있는 쉬운 표현으로 바꿔주세요.`;

export async function generateSummaryReport(
  input: SummaryReportInput
): Promise<SummaryReportResult> {
  const client = getAnthropicClient();

  const consultationHistory = input.consultations.length > 0
    ? input.consultations
        .map(
          (c) =>
            `[${c.consultedAt}] (${c.channel}) ${c.summary}\n상세: ${c.details}`
        )
        .join("\n\n")
    : "상담 기록 없음";

  const userMessage = `다음 케이스의 요약 리포트를 작성해주세요:

보호자명: ${input.guardianName}
케어 대상자: ${input.careRecipientName ?? "미확인"}
현재 상황: ${input.currentSituationSummary}

상담 기록:
${consultationHistory}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude API에서 텍스트 응답을 받지 못했습니다.");
  }

  const parsed: SummaryReportResult = JSON.parse(textBlock.text);
  return parsed;
}
