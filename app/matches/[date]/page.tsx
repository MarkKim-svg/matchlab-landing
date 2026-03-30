"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { KAKAO_CHANNEL_URL } from "@/lib/constants";
import { TeamLogo, LeagueBadge, ResultBadge, splitTeams, getKSTToday, formatKoreanDate } from "@/components/match-ui";
import type { MatchPrediction } from "@/lib/notion";

// --------------- helpers ---------------

function resolveDate(param: string): string {
  return param === "today" ? getKSTToday() : param;
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function getBestEnsemble(p: MatchPrediction): { label: string; pct: string } {
  const home = parseFloat(p.ensemble.home) || 0;
  const away = parseFloat(p.ensemble.away) || 0;
  const draw = parseFloat(p.ensemble.draw) || 0;
  const max = Math.max(home, away, draw);
  if (max === 0) return { label: p.prediction, pct: "" };
  if (max === home) return { label: "홈승", pct: `${p.ensemble.home}%` };
  if (max === away) return { label: "원정승", pct: `${p.ensemble.away}%` };
  return { label: "무승부", pct: `${p.ensemble.draw}%` };
}

// --------------- confidence sections ---------------

const CONF_SECTIONS: { stars: number; label: string; sub: string }[] = [
  { stars: 5, label: "⭐⭐⭐⭐⭐", sub: "최고 확신" },
  { stars: 4, label: "⭐⭐⭐⭐", sub: "높은 확신" },
  { stars: 3, label: "⭐⭐⭐", sub: "보통" },
  { stars: 2, label: "⭐⭐", sub: "낮음" },
  { stars: 1, label: "⭐", sub: "최저" },
];

// --------------- skeleton ---------------

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-[#334155] bg-[#1E293B] p-5">
      <div className="mb-3 h-5 w-24 rounded-full bg-slate-700" />
      <div className="mb-3 flex items-center justify-center gap-4">
        <div className="h-8 w-8 rounded-full bg-slate-700" />
        <div className="h-5 w-32 rounded bg-slate-700" />
        <div className="h-8 w-8 rounded-full bg-slate-700" />
      </div>
      <div className="flex justify-center">
        <div className="h-4 w-20 rounded bg-slate-700" />
      </div>
    </div>
  );
}

// =============== main page ===============

export default function MatchesDatePage() {
  const params = useParams<{ date: string }>();
  const router = useRouter();

  const dateStr = resolveDate(params.date);
  const isToday = dateStr === getKSTToday();

  const [matches, setMatches] = useState<MatchPrediction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [proCount, setProCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string>("free");

  // auth check
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

      if (data?.plan) setUserPlan(data.plan);
    }
    checkAuth();
  }, []);

  // fetch predictions
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/predictions/${dateStr}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setMatches(json.matches ?? []);
      setTotalCount(json.totalCount ?? 0);
      setProCount(json.proCount ?? 0);
    } catch {
      setError("데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isPro = userPlan === "pro";

  // nav
  const goDate = (d: string) => router.push(`/matches/${d}`);

  // group by confidence
  const grouped = CONF_SECTIONS.map((sec) => ({
    ...sec,
    matches: matches.filter((m) => m.confidence === sec.stars),
  })).filter((g) => g.matches.length > 0);

  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* ---- header ---- */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => goDate(shiftDate(dateStr, -1))}
              className="rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-sm text-slate-300 transition hover:border-emerald-500/50 hover:text-white"
            >
              ← 이전
            </button>

            <div className="text-center">
              <h1 className="text-lg font-bold sm:text-xl">{formatKoreanDate(dateStr)}</h1>
              {!isToday && (
                <button
                  onClick={() => goDate(getKSTToday())}
                  className="mt-1 text-xs text-emerald-400 hover:underline"
                >
                  오늘로 이동
                </button>
              )}
            </div>

            <button
              onClick={() => goDate(shiftDate(dateStr, 1))}
              className="rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-sm text-slate-300 transition hover:border-emerald-500/50 hover:text-white"
            >
              다음 →
            </button>
          </div>

          {!loading && !error && (
            <p className="mt-3 text-center text-sm text-slate-400">
              총 <span className="text-white font-semibold">{totalCount}</span>경기
              {proCount > 0 && (
                <>
                  {" · "}
                  <span className="text-amber-400 font-semibold">Pro 전용 {proCount}</span>경기
                </>
              )}
            </p>
          )}
        </div>

        {/* ---- loading ---- */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ---- error ---- */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchData}
              className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* ---- empty ---- */}
        {!loading && !error && matches.length === 0 && (
          <div className="rounded-xl border border-[#334155] bg-[#1E293B] p-10 text-center">
            <p className="mb-2 text-3xl">⚽</p>
            <p className="text-lg text-slate-300">이 날짜에 분석된 경기가 없습니다</p>
            <button
              onClick={() => goDate(getKSTToday())}
              className="mt-4 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"
            >
              다른 날짜 보기
            </button>
          </div>
        )}

        {/* ---- match groups ---- */}
        {!loading &&
          !error &&
          grouped.map((group) => {
            const isProSection = group.stars >= 4;

            return (
              <section key={group.stars} className="mb-8">
                {/* section header */}
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-base font-bold">
                    {group.label}{" "}
                    <span className="text-sm font-normal text-slate-400">{group.sub}</span>
                  </h2>
                  {isProSection && (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-400">
                      PRO
                    </span>
                  )}
                </div>

                {/* cards */}
                <div className="space-y-3">
                  {group.matches.map((m) => {
                    const locked = m.isProOnly && !isPro;
                    const [home, away] = splitTeams(m.match);
                    const best = getBestEnsemble(m);

                    const cardInner = (
                      <>
                        {/* league badge */}
                        <div className="mb-3 flex items-center justify-between">
                          <LeagueBadge league={m.league} />
                          <span className="text-xs text-slate-500">{m.confidenceLabel}</span>
                        </div>

                        {/* teams */}
                        <div className="mb-3 flex items-center justify-center gap-3">
                          <TeamLogo teamId={m.homeTeamId} teamName={home} size={32} />
                          <span className="text-base font-semibold text-white sm:text-lg">{home}</span>
                          <span className="text-sm text-slate-500">vs</span>
                          <span className="text-base font-semibold text-white sm:text-lg">{away}</span>
                          <TeamLogo teamId={m.awayTeamId} teamName={away} size={32} />
                        </div>

                        {/* prediction */}
                        <div className="mb-2 text-center">
                          <span className="text-sm font-medium text-emerald-400">
                            {best.label}
                            {best.pct && ` ${best.pct}`}
                          </span>
                        </div>

                        {/* result */}
                        <div className="text-center">
                          <ResultBadge isCorrect={m.isCorrect} />
                        </div>
                      </>
                    );

                    if (locked) {
                      return (
                        <a
                          key={m.id}
                          href={KAKAO_CHANNEL_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <div className="relative overflow-hidden rounded-xl border border-[#334155] bg-[#1E293B] p-5">
                            <div className="pointer-events-none select-none" style={{ filter: "blur(12px)" }}>
                              {cardInner}
                            </div>
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                              <span className="text-3xl">🔒</span>
                              <p className="mt-2 text-sm font-semibold text-white">Pro 전용 분석</p>
                              <span className="mt-2 inline-block rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 transition">
                                Pro 시작하기 — 월 9,900원
                              </span>
                            </div>
                          </div>
                        </a>
                      );
                    }

                    return (
                      <Link key={m.id} href={`/report/${m.id}`}>
                        <div className="rounded-xl border border-[#334155] bg-[#1E293B] p-5 transition hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                          {cardInner}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
      </div>
    </main>
  );
}
