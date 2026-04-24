"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, CalendarClock, Kanban, X, ChevronRight } from "lucide-react";

const STORAGE_KEY = "onboarding_done";

const steps = [
  {
    step: 1,
    title: "첫 케이스 등록",
    description: "첫 케이스를 등록해보세요. 보호자 이름과 연락처만 있으면 돼요.",
    href: "/leads/new",
    icon: UserPlus,
    buttonLabel: "케이스 등록하기",
  },
  {
    step: 2,
    title: "다음 연락일 설정",
    description: "다음 연락일을 설정하면, 연락할 날을 잊지 않아요.",
    href: "/leads",
    icon: CalendarClock,
    buttonLabel: "케이스 보기",
  },
  {
    step: 3,
    title: "진행 현황 확인",
    description: "진행 현황에서 모든 케이스를 한눈에 볼 수 있어요.",
    href: "/pipeline",
    icon: Kanban,
    buttonLabel: "현황 보기",
  },
];

export function OnboardingGuide() {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisible(true);
      }
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  }

  if (!visible) return null;

  if (completed) {
    return (
      <div className="mb-6 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-5 py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[16px] font-bold text-[#166534]">
              잘하셨어요!
            </p>
            <p className="mt-1 text-[14px] text-[#15803D]">
              이제 문의가 올 때마다 여기에 등록하면 돼요.
            </p>
          </div>
          <button
            onClick={dismiss}
            className="flex-shrink-0 rounded-lg p-1 text-[#15803D] transition-colors hover:bg-[#DCFCE7]"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    );
  }

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
      <div className="flex items-center justify-between border-b border-[#E5E5E5] px-5 py-3">
        <div>
          <p className="text-[14px] font-bold text-[#0A0A0A]">
            부모안심90에 오신 걸 환영해요!
          </p>
          <p className="text-[12px] text-[#737373]">
            센터 운영이 훨씬 편해질 거예요. ({currentStep + 1}/{steps.length}단계)
          </p>
        </div>
        <button
          onClick={dismiss}
          className="text-[13px] font-medium text-[#737373] transition-colors hover:text-[#0A0A0A]"
        >
          나중에 할게요
        </button>
      </div>

      <div className="px-5 py-5">
        {/* Step indicators */}
        <div className="mb-4 flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-colors"
              style={{
                backgroundColor: i <= currentStep ? "#D97706" : "#E5E5E5",
              }}
            />
          ))}
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#FFEDD5] text-[#D97706]">
            <Icon size={22} />
          </div>
          <div className="flex-1">
            <p className="text-[16px] font-bold text-[#0A0A0A]">{step.title}</p>
            <p className="mt-1 text-[14px] leading-[1.6] text-[#737373]">
              {step.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={step.href}
                className="inline-flex min-h-[44px] items-center gap-1 rounded-lg bg-[#D97706] px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#B45309]"
              >
                {step.buttonLabel}
                <ChevronRight size={16} />
              </Link>
              <button
                onClick={handleNext}
                className="inline-flex min-h-[44px] items-center gap-1 rounded-lg bg-[#EEEEEE] px-4 py-2.5 text-[14px] font-medium text-[#0A0A0A] transition-colors hover:bg-[#E5E5E5]"
              >
                {currentStep < steps.length - 1 ? "다음 단계" : "완료"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
