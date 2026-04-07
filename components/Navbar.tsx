"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Home, BarChart3, TrendingUp, Trophy } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const BeakerIcon = () => (
  <svg viewBox="4 2 66 76" className="w-9 h-10" fill="none">
    <path d="M10,10 L10,66 Q10,74 18,74 L54,74 Q62,74 62,66 L62,10" stroke="#10B981" strokeWidth="2.2" strokeLinejoin="round"/>
    <line x1="8" y1="10" x2="64" y2="10" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M62,10 L66,6" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round"/>
    <circle cx="25" cy="61" r="12" fill="#10B981"/><circle cx="49" cy="61" r="11" fill="#10B981" opacity="0.55"/><circle cx="36" cy="43" r="8" fill="#10B981" opacity="0.28"/>
  </svg>
);

const NAV_TABS = [
  { label: "홈", href: "/home", icon: Home },
  {
    label: "오늘의 분석",
    href: `/matches/${new Date().toISOString().split("T")[0]}`,
    match: "/matches/",
    icon: TrendingUp,
  },
  { label: "순위", href: "/standings", icon: Trophy },
  { label: "대시보드", href: "/dashboard", icon: BarChart3 },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const isLanding = pathname === "/";
  const isAuthPage = ["/home", "/matches/", "/dashboard", "/mypage", "/standings", "/report/"].some(p => pathname.startsWith(p));

  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("nickname, role")
          .eq("id", user.id)
          .single();
        if (data?.role === "admin") setIsAdmin(true);
        if (data?.nickname) {
          setNickname(data.nickname);
        } else {
          setNickname(
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "사용자"
          );
        }
      }
    }
    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setNickname("");
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  function isTabActive(tab: (typeof NAV_TABS)[number]) {
    if (tab.match) return pathname.startsWith(tab.match);
    return pathname === tab.href;
  }

  const showTabs = user && isAuthPage;

  return (
    <>
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-[#0A1121]/95 backdrop-blur-lg border-bg-border"
          : "bg-[#0A1121] border-bg-border/50"
      }`}
    >
      <div className="max-w-[1120px] mx-auto flex items-center justify-between h-[68px] px-4 sm:px-6">
        {/* ── Logo ── */}
        <Link
          href={user ? "/home" : "/"}
          className="flex items-center gap-2.5 shrink-0 transition-all duration-200"
          style={{ filter: "drop-shadow(0 0 0px transparent)" }}
          onMouseEnter={e => e.currentTarget.style.filter = "drop-shadow(0 0 6px rgba(16,185,129,0.4))"}
          onMouseLeave={e => e.currentTarget.style.filter = "drop-shadow(0 0 0px transparent)"}
        >
          <BeakerIcon />
          <span className="font-display font-bold text-xl tracking-[-1.2px] text-[#E1E7EF]">MATCHLAB</span>
        </Link>

        {/* ── Desktop Tabs (중앙) ── */}
        {showTabs && (
          <div className="hidden md:flex items-center gap-2">
            {NAV_TABS.map((tab) => {
              const active = isTabActive(tab);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex flex-col items-center gap-0.5 px-5 py-2.5 rounded-xl text-[12px] font-medium transition-all duration-200 ${
                    active
                      ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400"
                      : "bg-bg-800/60 border border-transparent text-text-secondary hover:bg-bg-700 hover:text-text-primary"
                  }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Right side ── */}
        <div className="flex items-center gap-3">
          {!user && !isLanding && (
            <a href="#dashboard" className="text-[14px] font-medium text-[#8494A7] hover:text-emerald-400 transition-colors font-body hidden md:block">
              적중률
            </a>
          )}

          {user ? (
            <>
              {isLanding && (
                <Link
                  href="/home"
                  className="text-[13px] font-medium px-3.5 py-1.5 rounded-full bg-emerald-500 text-white hover:bg-emerald-400 transition-colors font-body"
                >
                  홈으로 돌아가기 →
                </Link>
              )}
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-bg-border
                             hover:bg-bg-700 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
                    {nickname.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-bg-100 max-w-[80px] truncate hidden sm:block">
                    {nickname}
                  </span>
                  <ChevronDown />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-[#0F1729] border border-bg-border rounded-xl overflow-hidden shadow-lg shadow-black/30">
                    <button
                      onClick={() => { setMenuOpen(false); window.location.href = "/?landing=true"; }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-bg-200 hover:bg-bg-700 transition-colors cursor-pointer"
                    >
                      🏠 홈페이지 소개
                    </button>
                    <Link
                      href="/mypage"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-left px-4 py-2.5 text-sm text-bg-200 hover:bg-bg-700 transition-colors"
                    >
                      마이페이지
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block w-full text-left px-4 py-2.5 text-xs text-text-muted hover:bg-bg-700 transition-colors"
                      >
                        관리자
                      </Link>
                    )}
                    <div className="h-px bg-bg-border mx-2" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2.5 text-sm text-error hover:bg-bg-700 transition-colors cursor-pointer"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="text-[14px] font-medium px-4 py-1.5 rounded-lg border border-emerald-500 text-emerald-400
                         hover:bg-emerald-500 hover:text-white transition-colors font-body"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </nav>
    {/* Spacer for fixed navbar */}
    <div style={{ height: "68px" }} />
    </>
  );
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-bg-200">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
