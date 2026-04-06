"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, TrendingUp } from "lucide-react";

const tabs = [
  { label: "홈", href: "/home", icon: Home },
  {
    label: "오늘의 분석",
    href: `/matches/${new Date().toISOString().split("T")[0]}`,
    match: "/matches/",
    icon: TrendingUp,
  },
  { label: "대시보드", href: "/dashboard", icon: BarChart3 },
];

export default function AuthTabBar() {
  const pathname = usePathname();

  const showPaths = ["/home", "/matches/", "/dashboard", "/mypage"];
  const shouldShow = showPaths.some((p) => pathname.startsWith(p));
  if (!shouldShow) return null;

  function isActive(tab: (typeof tabs)[number]) {
    if (tab.match) return pathname.startsWith(tab.match);
    return pathname === tab.href;
  }

  return (
    <>
      {/* 데스크톱: Navbar와 시각적 통합 (간격 없음, 배경 통일) */}
      <div className="hidden md:block sticky top-14 z-40 bg-[#060B14]">
        <div className="max-w-5xl mx-auto flex justify-center gap-1">
          {tabs.map((tab) => {
            const active = isActive(tab);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                  active
                    ? "text-emerald-400 bg-emerald-500/5"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/[0.03]"
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {/* Animated underline */}
                <span
                  className={`absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all duration-300 ${
                    active
                      ? "bg-emerald-400 opacity-100 scale-x-100"
                      : "bg-emerald-400 opacity-0 scale-x-0"
                  }`}
                />
              </Link>
            );
          })}
        </div>
        <div className="h-px bg-bg-border" />
      </div>

      {/* 모바일: 하단 고정 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-bg-border bg-[#060B14]/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const active = isActive(tab);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-1 py-2.5 px-3 text-[11px] font-medium transition-all duration-200 relative ${
                  active
                    ? "text-emerald-400"
                    : "text-text-secondary"
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-3 right-3 h-[2px] bg-emerald-400 rounded-full" />
                )}
                <Icon size={20} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
