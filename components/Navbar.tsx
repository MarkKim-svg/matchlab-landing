"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const BeakerIcon = () => (
  <svg viewBox="4 2 66 76" className="w-6 h-7" fill="none">
    <path d="M10,10 L10,66 Q10,74 18,74 L54,74 Q62,74 62,66 L62,10" stroke="#10B981" strokeWidth="2.2" strokeLinejoin="round"/>
    <line x1="8" y1="10" x2="64" y2="10" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M62,10 L66,6" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round"/>
    <circle cx="25" cy="61" r="12" fill="#10B981"/><circle cx="49" cy="61" r="11" fill="#10B981" opacity="0.55"/><circle cx="36" cy="43" r="8" fill="#10B981" opacity="0.28"/>
  </svg>
);

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();

  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 스크롤 감지
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // 유저 정보 로드
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // profiles 테이블에서 닉네임 조회
        const { data } = await supabase
          .from("profiles")
          .select("nickname, role")
          .eq("id", user.id)
          .single();

        if (data?.role === "admin") setIsAdmin(true);

        if (data?.nickname) {
          setNickname(data.nickname);
        } else {
          // fallback: 이메일 앞부분 또는 provider 이름
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
      if (!session?.user) {
        setNickname("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 바깥 클릭 시 드롭다운 닫기
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

  return (
    <nav className={`sticky top-0 z-50 px-6 transition-all duration-300 ${scrolled ? "bg-[#060B14]/95 backdrop-blur-lg" : "bg-[#060B14]"}`}>
      <div className="max-w-[1120px] mx-auto flex justify-between items-center h-14">
        <Link href="/" className="group flex items-center gap-2 transition-all duration-200" style={{ filter: "drop-shadow(0 0 0px transparent)" }} onMouseEnter={e => e.currentTarget.style.filter = "drop-shadow(0 0 6px rgba(16,185,129,0.4))"} onMouseLeave={e => e.currentTarget.style.filter = "drop-shadow(0 0 0px transparent)"}>
          <BeakerIcon />
          <span className="font-display font-bold text-xl tracking-[-1.5px] text-[#E1E7EF]">MATCHLAB</span>
        </Link>

        <div className="flex items-center gap-4">
          {!user && (
            <a href="#dashboard" className="text-[14px] font-medium text-[#8494A7] hover:text-emerald-400 transition-colors font-body hidden md:block">적중률</a>
          )}

          {user ? (
            /* ── 로그인 상태 ── */
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/40
                           hover:bg-emerald-500/10 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
                  {nickname.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-bg-100 max-w-[100px] truncate hidden sm:block">
                  {nickname}
                </span>
                <ChevronDown />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-bg-800 border border-bg-700 rounded-[14px] overflow-hidden">
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
                      className="block w-full text-left px-4 py-2.5 text-xs text-[#566378] hover:bg-bg-700 transition-colors"
                    >
                      관리자
                    </Link>
                  )}
                  <div className="h-px bg-bg-700" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm text-error hover:bg-bg-700 transition-colors cursor-pointer"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── 비로그인 상태 ── */
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
  );
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-bg-200">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
