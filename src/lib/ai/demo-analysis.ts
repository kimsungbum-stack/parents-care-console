import type { ConsultationAnalysis } from "./prompts/consultation-analysis";

export function analyzeWithRegex(transcript: string): ConsultationAnalysis {
  // 이름 추출: "저는 xxx입니다", "xxx이라고 합니다", "xxx인데요"
  const namePatterns = [
    /저는\s+([가-힣]{2,4})입니다/,
    /([가-힣]{2,4})이라고\s*합니다/,
    /([가-힣]{2,4})인데요/,
    /제\s*이름은\s+([가-힣]{2,4})/,
  ];
  let guardianName: string | null = null;
  for (const pattern of namePatterns) {
    const match = transcript.match(pattern);
    if (match) {
      guardianName = match[1];
      break;
    }
  }

  // 전화번호 추출
  const phoneMatch = transcript.match(/01[016789]-?\d{3,4}-?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : null;

  // 나이 추출
  const agePatterns = [
    /(\d{2,3})세/,
    /(\d{2,3})살/,
    /([789]0)대/,
  ];
  let careRecipientAge: string | null = null;
  for (const pattern of agePatterns) {
    const match = transcript.match(pattern);
    if (match) {
      careRecipientAge = pattern.source.includes("대")
        ? `${match[1]}대`
        : `${match[1]}세`;
      break;
    }
  }

  // 긴급도 판별
  const highUrgencyKeywords = ["급한", "빨리", "당장", "응급", "위험", "쓰러", "넘어", "낙상", "치매", "독거"];
  const lowUrgencyKeywords = ["알아보는 중", "비교", "여러 곳", "생각 중"];

  let urgency: "높음" | "보통" | "낮음" = "보통";
  if (highUrgencyKeywords.some((kw) => transcript.includes(kw))) {
    urgency = "높음";
  } else if (lowUrgencyKeywords.some((kw) => transcript.includes(kw))) {
    urgency = "낮음";
  }

  // 날짜 계산
  const today = new Date();
  const daysToAdd = urgency === "높음" ? 1 : urgency === "낮음" ? 7 : 3;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysToAdd);
  const recommendedNextContactDate = nextDate.toISOString().slice(0, 10);

  // 관계 추출
  const relationshipPatterns = [
    /제\s*(아들|딸|며느리|아내|남편|손자|손녀)/,
    /(아들|딸|며느리|아내|남편|손자|손녀)입니다/,
    /(아들|딸|며느리|아내|남편|손자|손녀)인데/,
  ];
  let relationship: string | null = null;
  for (const pattern of relationshipPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      relationship = match[1];
      break;
    }
  }

  // 요약 및 상황
  const summary = transcript.length > 100
    ? transcript.slice(0, 100) + "..."
    : transcript;

  const currentSituation = transcript.length > 200
    ? transcript.slice(0, 200)
    : transcript;

  // 핵심 니즈 키워드 기반 추출
  const needsKeywords = [
    { keyword: "주간보호", need: "주간보호 서비스 이용 희망" },
    { keyword: "방문요양", need: "방문요양 서비스 문의" },
    { keyword: "입소", need: "시설 입소 상담" },
    { keyword: "치매", need: "치매 관련 케어 필요" },
    { keyword: "재활", need: "재활 프로그램 문의" },
    { keyword: "목욕", need: "목욕 서비스 필요" },
    { keyword: "식사", need: "식사 지원 필요" },
    { keyword: "등급", need: "장기요양등급 관련 문의" },
  ];

  const detectedNeeds = needsKeywords
    .filter((n) => transcript.includes(n.keyword))
    .map((n) => n.need);

  const coreNeeds = detectedNeeds.length > 0
    ? detectedNeeds.join(", ")
    : "상담 내용 확인 필요";

  // 권장 행동
  const recommendedAction =
    urgency === "높음"
      ? "오늘 중 연락"
      : urgency === "낮음"
        ? "1주일 내 연락"
        : "3일 내 연락";

  return {
    guardianName,
    phone,
    relationship,
    careRecipientName: null,
    careRecipientAge,
    currentSituation,
    urgency,
    coreNeeds,
    recommendedNextContactDate,
    recommendedAction,
    summary,
  };
}
