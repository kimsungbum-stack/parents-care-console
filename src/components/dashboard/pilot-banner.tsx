"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "pilot-banner-dismissed";

export function PilotBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
  }, []);

  function handleDismiss() {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }

  if (!visible) return null;

  return (
    <div className="mb-5 flex items-center justify-between gap-3 rounded-xl bg-[#FFEDD5] px-5 py-3.5 border border-[#D97706]/20">
      <p className="text-[14px] font-medium text-[#92400E]">
        현재 파일럿 운영 중이에요. 불편한 점은 언제든 말씀해주세요 💬
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        className="flex-shrink-0 rounded-lg p-1 text-[#92400E] transition-colors hover:bg-[#D97706]/10"
        aria-label="닫기"
      >
        <X size={18} />
      </button>
    </div>
  );
}
