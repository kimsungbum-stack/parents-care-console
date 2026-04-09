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
    <div className="rounded-xl border border-[#E5E5E5] bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[#FAFAFA]"
      >
        <div>
          <h2 className="text-[15px] font-bold text-[#0A0A0A]">전환율 퍼널</h2>
          <p className="mt-0.5 text-[13px] text-[#737373]">단계별 케이스 수와 전환율</p>
        </div>
        <ChevronDown
          size={18}
          className={`text-[#A3A3A3] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-[#E5E5E5] px-5 py-4">
          <FunnelChart data={funnelData} />
        </div>
      )}
    </div>
  );
}
