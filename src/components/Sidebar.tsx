"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, UserPlus, Heart, Kanban, CreditCard, Settings, LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const mainNavItems = [
  { href: "/", label: "대시보드", shortLabel: "홈", icon: LayoutDashboard, showInMobileTab: true },
  { href: "/pipeline", label: "진행 현황", shortLabel: "현황", icon: Kanban, showInMobileTab: true },
  { href: "/leads", label: "케이스 목록", shortLabel: "목록", icon: Users, showInMobileTab: true },
  { href: "/leads/new", label: "신규 케이스", shortLabel: "신규", icon: UserPlus, showInMobileTab: true },
  { href: "/pricing", label: "요금제", shortLabel: "요금제", icon: CreditCard, showInMobileTab: true },
  { href: "/settings", label: "설정", shortLabel: "설정", icon: Settings, showInMobileTab: true },
] as const;

const mobileTabItems = mainNavItems.filter((item) => item.showInMobileTab);

const authPaths = ["/login", "/auth/callback", "/onboarding/org-setup"];

function useUserInfo() {
  const [info, setInfo] = useState<{ name: string | null; email: string | null; role: string }>({
    name: null,
    email: null,
    role: "admin",
  });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      let role = "admin";

      if (user) {
        // 사용자 역할 조회
        const { data: userRow } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .limit(1)
          .single();
        if (userRow) role = userRow.role;

        // 초대 자동 수락 시도
        fetch("/api/auth/accept-invite", { method: "POST" }).catch(() => {});
      }

      setInfo({
        name: user?.user_metadata?.full_name ?? null,
        email: user?.email ?? null,
        role,
      });
    });
  }, []);

  return info;
}

function SidebarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { name, email } = useUserInfo();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* 로고 */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D97706] text-white">
            <Heart size={20} />
          </div>
          <div>
            <p className="text-[16px] font-bold tracking-tight text-white">부모안심90</p>
            <p className="mt-px text-[12px] text-white/45">운영 콘솔</p>
          </div>
        </div>
      </div>

      {/* 내비게이션 */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-white/35">
          메뉴
        </p>
        <div className="flex flex-col gap-0.5">
          {mainNavItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] transition-all duration-150",
                  isActive
                    ? "bg-[#D97706]/[0.12] font-semibold text-[#D97706]"
                    : "font-medium text-white hover:bg-white/5 hover:pl-4",
                )}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#D97706]"
                  />
                )}
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 하단 — 사용자 정보 + 로그아웃 */}
      <div className="border-t border-white/10 px-5 py-4">
        {(name || email) ? (
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              {name && (
                <p className="truncate text-[13px] font-semibold text-white/80">{name}</p>
              )}
              {email && (
                <p className={cn("truncate text-[12px] text-white/45", name && "mt-px")}>
                  {email}
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 flex-shrink-0 rounded-lg p-1.5 text-white/45 transition-colors hover:bg-white/10 hover:text-white/80"
              aria-label="로그아웃"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <p className="text-[12px] leading-relaxed text-white/35">
            신규 등록 → 상태 정리 → 상담 기록 저장
          </p>
        )}
      </div>
    </>
  );
}

function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[#E5E5E5] bg-white lg:hidden">
      {mobileTabItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
              isActive ? "text-[#D97706]" : "text-[#737373]",
            )}
          >
            {isActive && (
              <span
                aria-hidden
                className="absolute left-1/2 top-0 h-[3px] w-8 -translate-x-1/2 rounded-b-full bg-[#D97706]"
              />
            )}
            <Icon size={21} strokeWidth={isActive ? 2.2 : 1.8} />
            <span>{item.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p));

  if (isAuthPage) return null;

  return (
    <>
      {/* 데스크탑 사이드바 */}
      <aside className="sticky top-0 hidden h-screen w-[260px] flex-shrink-0 flex-col bg-[#0A0A0A] lg:flex">
        <SidebarContent />
      </aside>

      {/* 모바일 하단 탭바 */}
      <BottomTabBar />
    </>
  );
}
