"use client";

import dynamic from "next/dynamic";

export type FunnelDataItem = {
  label: string;
  count: number;
  displayLabel: string;
  color: string;
};

// recharts는 SSR에서 window를 참조해 오류 발생 → ssr: false로 lazy-load
const FunnelChartInner = dynamic(
  () => import("./funnel-chart-inner").then((m) => ({ default: m.FunnelChartInner })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[200px] items-center justify-center">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#D97706] border-t-transparent" />
      </div>
    ),
  },
);

export function FunnelChart({ data }: { data: FunnelDataItem[] }) {
  return <FunnelChartInner data={data} />;
}
