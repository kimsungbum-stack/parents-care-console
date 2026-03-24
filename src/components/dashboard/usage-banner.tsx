"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface UsageData {
  plan: string;
  used: number;
  limit: number;
}

const DEFAULT_USAGE: UsageData = { plan: "free", used: 0, limit: 15 };

export function UsageBanner() {
  const [usage, setUsage] = useState<UsageData>(DEFAULT_USAGE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch("/api/v1/usage");
        if (res.ok) {
          const data = await res.json();
          setUsage({
            plan: data.plan ?? "free",
            used: data.usedThisMonth ?? data.used ?? 0,
            limit: data.limit ?? 15,
          });
        }
      } catch {
        // API unavailable — use defaults
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, []);

  if (loading) return null;
  if (usage.plan !== "free") return null;

  const percent = usage.limit > 0 ? Math.min((usage.used / usage.limit) * 100, 100) : 0;
  const remaining = Math.max(usage.limit - usage.used, 0);
  const isWarning = percent >= 80 && percent < 100;
  const isFull = percent >= 100;

  if (isFull) {
    return (
      <div className="mb-6 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[15px] font-bold text-[#991B1B]">
              이번 달 무료 등록을 다 쓰셨어요
            </p>
            <p className="mt-1 text-[13px] text-[#DC2626]">
              스탠다드로 올리면 계속 쓸 수 있어요.
            </p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-xl bg-[#D97706] px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#B45309]"
          >
            스탠다드로 올리기
          </Link>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#FECACA]">
          <div className="h-full rounded-full bg-[#DC2626]" style={{ width: "100%" }} />
        </div>
        <p className="mt-1.5 text-[13px] text-[#991B1B]">
          {usage.used}/{usage.limit}건 사용
        </p>
      </div>
    );
  }

  if (isWarning) {
    return (
      <div className="mb-6 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-5 py-4">
        <p className="text-[15px] font-bold text-[#92400E]">
          이번 달 남은 등록이 {remaining}건이에요
        </p>
        <p className="mt-1 text-[13px] text-[#B45309]">
          스탠다드로 업그레이드하면 걱정 없어요.
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#FEF3C7]">
          <div
            className="h-full rounded-full bg-[#D97706] transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-1.5 text-[13px] text-[#92400E]">
          {usage.used}/{usage.limit}건 사용
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-[#E7E0D5] bg-white px-5 py-4">
      <p className="text-[15px] font-medium text-[#292524]">
        이번 달 {usage.used}/{usage.limit}건 사용했어요
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F5F0E8]">
        <div
          className="h-full rounded-full bg-[#A8A29E] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
