"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import type { FunnelDataItem } from "./funnel-chart";

export function FunnelChartInner({ data }: { data: FunnelDataItem[] }) {
  if (data.every((d) => d.count === 0)) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center gap-2">
        <p className="text-[15px] font-medium text-[#0A0A0A]">아직 케이스가 없어요</p>
        <p className="text-[13px] text-[#737373]">케이스가 등록되면 단계별 전환율이 여기 표시돼요.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={data.length * 52 + 16}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 140, left: 8, bottom: 4 }}
        barSize={28}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={76}
          tick={{ fontSize: 13, fill: "#737373" }}
          axisLine={false}
          tickLine={false}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} isAnimationActive={false}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
          <LabelList
            dataKey="displayLabel"
            position="right"
            style={{ fontSize: 13, fontWeight: 600, fill: "#0A0A0A" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
