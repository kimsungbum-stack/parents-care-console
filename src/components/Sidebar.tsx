"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserPlus, Heart } from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const mainNavItems = [
  { href: "/", label: "대시보드", shortLabel: "대시보드", icon: LayoutDashboard },
  { href: "/leads", label: "케이스 목록", shortLabel: "목록", icon: Users },
  { href: "/leads/new", label: "신규 케이스", shortLabel: "신규", icon: UserPlus },
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
        <div className="mb-6">
          <p className="mb-3 px-3 text-[13px] font-medium text-[#F5F0E8]">메인</p>
          <div className="space-y-1">
            {mainNavItems.map((item) => {
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
      </nav>

      <div className="mt-auto border-t border-white/10 px-5 py-4">
        <p className="text-[13px] leading-6 text-[#F5F0E8]">
          신규 등록 → 상태 정리 → 상담 기록 저장
        </p>
      </div>
    </>
  );
}

function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[#E7E0D5] bg-white lg:hidden">
      {mainNavItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[12px] font-medium transition-colors",
              isActive ? "text-[#D97706]" : "text-[#78716C]",
            )}
          >
            <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
            <span>{item.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  return (
    <>
      {/* 데스크탑 사이드바 */}
      <aside className="sticky top-0 hidden h-screen w-[260px] flex-shrink-0 flex-col bg-[#1C1917] lg:flex">
        <SidebarContent />
      </aside>

      {/* 모바일 하단 탭바 */}
      <BottomTabBar />
    </>
  );
}
