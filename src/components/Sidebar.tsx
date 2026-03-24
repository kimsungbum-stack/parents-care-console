"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, UserPlus, LogIn, Menu, X, Heart } from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const navSections = [
  {
    label: "메인",
    items: [
      { href: "/", label: "대시보드", icon: LayoutDashboard },
      { href: "/leads", label: "케이스 목록", icon: Users },
      { href: "/leads/new", label: "신규 케이스", icon: UserPlus },
    ],
  },
  {
    label: "기타",
    items: [{ href: "/login", label: "로그인", icon: LogIn }],
  },
] as const;

function SidebarContent() {
  const pathname = usePathname();

  return (
    <>
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D97706] text-white">
            <Heart size={20} />
          </div>
          <div>
            <p className="text-[16px] font-bold tracking-tight text-[#FEFCF8]">부모안심90</p>
            <p className="text-[13px] text-[#A8A29E]">운영 콘솔</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        {navSections.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="mb-3 px-3 text-[13px] font-medium text-[#78716C]">{section.label}</p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium transition-colors",
                      isActive
                        ? "bg-[#D97706]/15 text-[#D97706]"
                        : "text-[#D6D3D1] hover:bg-white/5 hover:text-[#FEFCF8]",
                    )}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 px-5 py-4">
        <p className="text-[13px] leading-6 text-[#78716C]">
          신규 등록 → 상태 정리 → 상담 기록 저장
        </p>
      </div>
    </>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <header className="fixed top-0 right-0 left-0 z-40 flex h-14 items-center justify-between border-b border-[#E7E0D5] bg-[#1C1917] px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <Heart size={18} className="text-[#D97706]" />
          <span className="text-[15px] font-bold text-[#FEFCF8]">부모안심90</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#FEFCF8] hover:bg-white/10"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed top-14 bottom-0 left-0 z-30 flex w-[280px] flex-col bg-[#1C1917] transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[260px] flex-shrink-0 flex-col bg-[#1C1917] lg:flex">
        <SidebarContent />
      </aside>

      {/* Spacer for mobile header */}
      <div className="h-14 lg:hidden" />
    </>
  );
}
