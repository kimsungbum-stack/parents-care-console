"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FunnelChart, type FunnelDataItem } from "@/components/dashboard/funnel-chart";

type Props = {
  funnelData: FunnelDataItem[];
};

export function DashboardFunnelToggle({ funnelData }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-[#E7E0D5] bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[#FEFCF8]"
      >
        <div>
          <h2 className="text-[15px] font-bold text-[#292524]">전환율 퍼널</h2>
          <p className="mt-0.5 text-[13px] text-[#78716C]">단계별 케이스 수와 전환율</p>
        </div>
        <ChevronDown
          size={18}
          className={`text-[#A8A29E] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-[#E7E0D5] px-5 py-4">
          <FunnelChart data={funnelData} />
        </div>
      )}
    </div>
  );
}
