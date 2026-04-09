import Link from "next/link";
import { Check, Minus } from "lucide-react";

const plans = [
  {
    name: "무료",
    price: "0원",
    period: "",
    badge: null,
    highlight: false,
    description: "부담 없이 시작하세요. 모든 기능을 무료로 체험할 수 있어요.",
    cta: "지금 바로 시작하기",
    ctaHref: "/leads/new",
    features: ["월 15건 케이스 등록", "진행 현황 보기", "상담 기록 저장"],
  },
  {
    name: "스탠다드",
    price: "월 4.9만원",
    period: "(VAT 별도)",
    badge: "가장 많이 선택",
    highlight: true,
    description: "가장 많은 센터장님이 선택한 요금제. 어르신 1명만 더 모시면 26배 가치.",
    cta: "스탠다드 시작하기",
    ctaHref: "https://pf.kakao.com/_xjKxbxj/chat",
    features: [
      "무제한 케이스 등록",
      "진행 현황 보기",
      "상담 기록 저장",
      "AI 상담 분석 월 5회 (준비 중)",
      "알림톡 발송",
      "월간 리포트",
      "데이터 내보내기",
    ],
  },
  {
    name: "프리미엄",
    price: "월 9.9만원",
    period: "(VAT 별도)",
    badge: null,
    highlight: false,
    description: "AI가 상담을 자동으로 정리해드려요. 여러 지점도 한눈에 관리하세요.",
    cta: "프리미엄 상담받기",
    ctaHref: "https://pf.kakao.com/_xjKxbxj/chat",
    features: [
      "무제한 케이스 등록",
      "진행 현황 보기",
      "상담 기록 저장",
      "알림톡 발송",
      "월간 리포트",
      "데이터 내보내기",
      "AI 상담 분석 무제한 (준비 중)",
      "다지점 관리 (준비 중)",
      "전담 지원 매니저",
    ],
  },
];

const comparisonFeatures = [
  { label: "케이스 등록", free: "월 15건", standard: "무제한", premium: "무제한" },
  { label: "진행 현황", free: true, standard: true, premium: true },
  { label: "상담 기록", free: true, standard: true, premium: true },
  { label: "알림톡", free: false, standard: true, premium: true },
  { label: "리포트", free: false, standard: true, premium: true },
  { label: "내보내기", free: false, standard: true, premium: true },
  { label: "AI 분석 (준비 중)", free: false, standard: "월 5회", premium: "무제한" },
  { label: "다지점 (준비 중)", free: false, standard: false, premium: true },
  { label: "전담 지원", free: false, standard: false, premium: true },
];

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-[14px] font-medium text-[#0A0A0A]">{value}</span>;
  }
  return value ? (
    <Check size={18} className="mx-auto text-[#16A34A]" />
  ) : (
    <Minus size={18} className="mx-auto text-[#D6D3D1]" />
  );
}

export default function PricingPage() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8">
      <div className="mb-8 text-center">
        <h1 className="text-[24px] font-bold tracking-tight text-[#0A0A0A]">
          센터 운영에 딱 맞는 요금제
        </h1>
        <p className="mt-2 text-[15px] text-[#737373]">
          처음엔 무료로 시작하고, 센터가 커지면 함께 늘려가세요
        </p>
      </div>

      {/* Plan Cards */}
      <div className="mx-auto mb-10 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="relative flex flex-col rounded-xl border bg-white p-6"
            style={{
              borderColor: plan.highlight ? "#D97706" : "#E5E5E5",
              borderWidth: plan.highlight ? 2 : 1,
            }}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#D97706] px-3 py-1 text-[12px] font-bold text-white">
                {plan.badge}
              </span>
            )}
            <h2 className="text-[18px] font-bold text-[#0A0A0A]">{plan.name}</h2>
            <p className="mt-1 text-[13px] leading-[1.5] text-[#737373]">{plan.description}</p>
            <p className="mt-3 text-[28px] font-bold text-[#0A0A0A]">{plan.price}</p>
            {plan.period && (
              <p className="text-[13px] text-[#737373]">{plan.period}</p>
            )}
            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[14px] text-[#0A0A0A]">
                  <Check size={16} className="mt-0.5 flex-shrink-0 text-[#16A34A]" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={plan.ctaHref}
              className="mt-6 block min-h-[44px] rounded-lg py-3 text-center text-[15px] font-bold transition-colors"
              style={
                plan.highlight
                  ? { backgroundColor: "#D97706", color: "#FFFFFF" }
                  : { backgroundColor: "#EEEEEE", color: "#0A0A0A" }
              }
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* Value Proposition */}
      <div className="mx-auto mb-10 max-w-4xl rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-6 py-5 text-center">
        <p className="text-[18px] font-bold text-[#92400E]">
          어르신 1명 추가 = 월 130만원. 구독료의 26배 가치
        </p>
        <p className="mt-1 text-[15px] text-[#B45309]">
          어르신 1분이 주간보호를 이용하시면 월 100~130만원.{" "}
          구독료 4만9천원의 <span className="font-bold">26배</span>예요.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
        <div className="border-b border-[#E5E5E5] px-5 py-4">
          <h2 className="text-[16px] font-bold text-[#0A0A0A]">기능 비교표</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA] text-[13px] text-[#737373]">
                <th className="px-5 py-3 text-left font-medium">기능</th>
                <th className="px-4 py-3 font-medium">무료</th>
                <th className="px-4 py-3 font-medium">스탠다드</th>
                <th className="px-4 py-3 font-medium">프리미엄</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((row) => (
                <tr key={row.label} className="border-b border-[#E5E5E5]/60">
                  <td className="px-5 py-3 text-left text-[14px] font-medium text-[#0A0A0A]">
                    {row.label}
                  </td>
                  <td className="px-4 py-3">
                    <FeatureCell value={row.free} />
                  </td>
                  <td className="px-4 py-3">
                    <FeatureCell value={row.standard} />
                  </td>
                  <td className="px-4 py-3">
                    <FeatureCell value={row.premium} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
