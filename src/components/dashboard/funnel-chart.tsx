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

export type FunnelDataItem = {
  label: string;
  count: number;
  displayLabel: string;
  color: string;
};

export function FunnelChart({ data }: { data: FunnelDataItem[] }) {
  if (data.every((d) => d.count === 0)) {
    return (
      <div className="flex h-[200px] items-center justify-center text-[14px] text-[#A8A29E]">
        아직 등록된 케이스가 없어요.
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
          tick={{ fontSize: 13, fill: "#78716C" }}
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
            style={{ fontSize: 13, fontWeight: 600, fill: "#292524" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
