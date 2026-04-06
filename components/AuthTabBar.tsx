"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, TrendingUp, User } from "lucide-react";

const tabs = [
  { label: "홈", href: "/home", icon: Home },
  {
    label: "오늘의 분석",
    href: `/matches/${new Date().toISOString().split("T")[0]}`,
    match: "/matches/",
    icon: TrendingUp,
  },
  { label: "대시보드", href: "/dashboard", icon: BarChart3 },
  { label: "마이페이지", href: "/mypage", icon: User },
];

export default function AuthTabBar() {
  const pathname = usePathname();

  // 로그인 유저 경로에서만 표시
  const showPaths = ["/home", "/matches/", "/dashboard", "/mypage"];
  const shouldShow = showPaths.some((p) => pathname.startsWith(p));
  if (!shouldShow) return null;

  function isActive(tab: (typeof tabs)[number]) {
    if (tab.match) return pathname.startsWith(tab.match);
    return pathname === tab.href;
  }

  return (
    <>
      {/* 데스크톱: Navbar 바로 아래 sticky */}
      <div className="hidden md:block sticky top-14 z-40 border-b border-bg-border bg-bg-deep">
        <div className="max-w-5xl mx-auto flex justify-around">
          {tabs.map((tab) => {
            const active = isActive(tab);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                  active
                    ? "text-emerald-400"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 모바일: 화면 하단 고정 탭 바 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-bg-border bg-bg-deep pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const active = isActive(tab);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-2 px-3 text-[11px] font-medium transition-colors ${
                active
                  ? "text-emerald-400"
                  : "text-text-secondary"
              }`}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
