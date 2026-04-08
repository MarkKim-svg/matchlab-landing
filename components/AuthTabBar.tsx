"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, TrendingUp, Trophy, Shield } from "lucide-react";

const tabs = [
  { label: "홈", href: "/home", icon: Home },
  {
    label: "오늘의 분석",
    href: `/matches/${new Date().toISOString().split("T")[0]}`,
    match: "/matches/",
    icon: TrendingUp,
  },
  { label: "순위", href: "/standings", icon: Trophy },
  { label: "팀/선수", href: "/teams", icon: Shield },
  { label: "대시보드", href: "/dashboard", icon: BarChart3 },
];

export default function AuthTabBar() {
  const pathname = usePathname();

  const showPaths = ["/home", "/matches/", "/dashboard", "/mypage", "/standings", "/report/", "/teams", "/team/", "/player/"];
  const shouldShow = showPaths.some((p) => pathname.startsWith(p));
  if (!shouldShow) return null;

  function isActive(tab: (typeof tabs)[number]) {
    if (tab.match) return pathname.startsWith(tab.match);
    return pathname === tab.href;
  }

  // 모바일 하단 탭바만 렌더 (데스크톱 탭은 Navbar에 통합됨)
  return (
    <>
      {/* Mobile spacer for fixed bottom tab bar */}
      <div className="md:hidden" style={{ height: "72px" }} />
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-bg-border bg-[#0A1121]/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const active = isActive(tab);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl mx-1 my-1.5 text-[11px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-text-secondary"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
