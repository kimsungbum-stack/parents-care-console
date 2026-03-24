"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const [plan, setPlan] = useState("무료");

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch("/api/v1/usage");
        if (res.ok) {
          const data = await res.json();
          const planMap: Record<string, string> = {
            free: "무료",
            standard: "스탠다드",
            premium: "프리미엄",
          };
          setPlan(planMap[data.plan] ?? "무료");
        }
      } catch {
        // API unavailable
      }
    }
    fetchPlan();
  }, []);

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-bold tracking-tight text-[#292524]">설정</h1>
        <p className="mt-1 text-[15px] text-[#78716C]">센터 운영 설정을 관리하세요.</p>
      </div>

      {/* Plan Section */}
      <div className="mb-5 rounded-xl border border-[#E7E0D5] bg-white">
        <div className="flex items-center gap-3 border-b border-[#E7E0D5] px-5 py-4">
          <CreditCard size={18} className="text-[#78716C]" />
          <h2 className="text-[16px] font-bold text-[#292524]">요금제</h2>
        </div>
        <div className="px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13px] text-[#78716C]">현재 요금제</p>
              <p className="mt-1 text-[18px] font-bold text-[#292524]">{plan}</p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl bg-[#D97706] px-5 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#B45309]"
            >
              요금제 변경하기
            </Link>
          </div>
        </div>
      </div>

      {/* Placeholder sections */}
      <div className="mb-5 rounded-xl border border-[#E7E0D5] bg-white">
        <div className="flex items-center gap-3 border-b border-[#E7E0D5] px-5 py-4">
          <Settings size={18} className="text-[#78716C]" />
          <h2 className="text-[16px] font-bold text-[#292524]">센터 정보</h2>
        </div>
        <div className="px-5 py-8 text-center">
          <p className="text-[14px] text-[#A8A29E]">준비 중이에요</p>
        </div>
      </div>

      <div className="rounded-xl border border-[#E7E0D5] bg-white">
        <div className="flex items-center gap-3 border-b border-[#E7E0D5] px-5 py-4">
          <Settings size={18} className="text-[#78716C]" />
          <h2 className="text-[16px] font-bold text-[#292524]">알림 설정</h2>
        </div>
        <div className="px-5 py-8 text-center">
          <p className="text-[14px] text-[#A8A29E]">준비 중이에요</p>
        </div>
      </div>
    </div>
  );
}
