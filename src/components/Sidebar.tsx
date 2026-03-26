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
  { href: "/pricing", label: "요금제", shortLabel: "요금제", icon: CreditCard, showInMobileTab: false },
  { href: "/settings", label: "설정", shortLabel: "설정", icon: Settings, showInMobileTab: false },
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
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "24px" }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: "#D97706", color: "#FFFFFF" }}
          >
            <Heart size={20} />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.01em" }}>
              부모안심90
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>운영 콘솔</p>
          </div>
        </div>
      </div>

      {/* 내비게이션 */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "20px 12px" }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "0 12px",
            marginBottom: 8,
          }}
        >
          메뉴
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {mainNavItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                style={
                  isActive
                    ? {
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        borderRadius: 12,
                        padding: "10px 12px",
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#F59E0B",
                        backgroundColor: "rgba(245,158,11,0.12)",
                        textDecoration: "none",
                      }
                    : {
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        borderRadius: 12,
                        padding: "10px 12px",
                        fontSize: 15,
                        fontWeight: 500,
                        color: "#FFFFFF",
                        textDecoration: "none",
                      }
                }
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 하단 — 사용자 정보 + 로그아웃 */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "16px 20px" }}>
        {(name || email) ? (
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              {name && (
                <p
                  className="truncate"
                  style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}
                >
                  {name}
                </p>
              )}
              {email && (
                <p
                  className="truncate"
                  style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: name ? 1 : 0 }}
                >
                  {email}
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 flex-shrink-0 rounded-lg p-1.5 transition-colors hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.45)" }}
              aria-label="로그아웃"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[#E7E0D5] bg-white lg:hidden">
      {mobileTabItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
              isActive ? "text-[#F59E0B]" : "text-[#78716C]",
            )}
          >
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
      {/* 데스크탑 사이드바 — Tailwind text-white 대신 inline style로 강제 */}
      <aside
        className="sticky top-0 hidden h-screen w-[260px] flex-shrink-0 flex-col lg:flex"
        style={{ backgroundColor: "#1C1917" }}
      >
        <SidebarContent />
      </aside>

      {/* 모바일 하단 탭바 */}
      <BottomTabBar />
    </>
  );
}
