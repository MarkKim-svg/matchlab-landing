"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import AuthTabBar from "@/components/AuthTabBar";

interface Profile {
  id: string;
  nickname: string | null;
  email: string | null;
  avatar_url: string | null;
  plan: string | null;
}

export default function MyPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?redirect=/mypage");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, nickname, email, avatar_url, plan")
        .eq("id", user.id)
        .single();

      setProfile({
        id: user.id,
        nickname: data?.nickname || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "사용자",
        email: data?.email || user.email || null,
        avatar_url: data?.avatar_url || null,
        plan: data?.plan || "free",
      });
      setLoading(false);
    }
    load();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#0F172A] flex items-center justify-center">
        <div className="text-gray-400 text-sm">로딩 중...</div>
      </div>
    );
  }

  if (!profile) return null;

  const isFree = profile.plan !== "pro";

  return (
    <div className="min-h-dvh bg-[#0F172A]">
      <AuthTabBar />
      <div className="w-full max-w-7xl mx-auto space-y-5 px-4 md:px-8 py-12 pb-24 md:pb-12">
        {/* 뒤로가기 */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-emerald-400 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          홈으로
        </Link>

        {/* 프로필 카드 */}
        <div className="bg-[#1E293B] rounded-2xl p-6 border border-[#334155]">
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl font-bold shrink-0">
                {(profile.nickname ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xl font-bold text-white truncate">
                {profile.nickname}
              </p>
              {profile.email && (
                <p className="text-sm text-gray-400 truncate">{profile.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* 구독 상태 카드 */}
        <div className="bg-[#1E293B] rounded-2xl p-6 border border-[#334155]">
          {isFree ? (
            <>
              <p className="text-lg font-bold text-white mb-4">Free 플랜</p>

              <p className="text-sm text-gray-400 mb-3">
                Pro로 업그레이드하면 모든 분석을 이용할 수 있어요
              </p>

              <ul className="space-y-2.5 mb-6">
                {[
                  "⭐⭐⭐⭐+ 고확신 경기 분석",
                  "배당 이동 분석",
                  "Claude AI 상세 근거",
                  "전경기 리포트",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href="/pricing"
                className="block w-full text-center py-3 rounded-xl font-medium text-white bg-emerald-500 hover:bg-emerald-400 transition-colors"
              >
                Pro 업그레이드 — 월 9,900원
              </a>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-lg font-bold text-white">Pro 플랜</p>
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-[#F59E0B]/20 text-[#F59E0B]">
                  PRO
                </span>
              </div>
              <p className="text-sm text-gray-400">
                구독 관리 기능은 준비 중입니다
              </p>
            </>
          )}
        </div>

        {/* 로그아웃 */}
        <button
          onClick={handleSignOut}
          className="w-full py-3 rounded-xl text-sm font-medium border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
