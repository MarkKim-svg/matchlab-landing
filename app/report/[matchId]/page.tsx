"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TeamLogo, LeagueBadge, ResultBadge, splitTeams, formatKoreanDate, fmtPct } from "@/components/match-ui";
import Navbar from "@/components/Navbar";
import AuthTabBar from "@/components/AuthTabBar";
import { FormTable, StatsTable, H2HTable, InjuriesList, MatchDetailSkeleton, type MatchDetail } from "@/components/report/MatchDetailTables";
import type { MatchPrediction, MatchReport } from "@/lib/notion";
import NewsletterReport from "./NewsletterReport";

// --------------- probability bar ---------------

function ProbBar({ label, value, highlight }: { label: string; value: string; highlight: boolean }) {
  const { num, display } = fmtPct(value);
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-right text-sm text-slate-400 shrink-0">{label}</span>
      <div className="flex-1 h-6 rounded-full bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${highlight ? "bg-emerald-500" : "bg-slate-500"}`}
          style={{ width: `${Math.min(num, 100)}%` }}
        />
      </div>
      <span className={`w-14 text-sm font-medium shrink-0 ${highlight ? "text-emerald-400" : "text-slate-300"}`}>
        {display}
      </span>
    </div>
  );
}

// --------------- model row ---------------

function ModelRow({ name, home, away }: { name: string; home: string; away: string }) {
  const hPct = fmtPct(home);
  const aPct = fmtPct(away);
  const homeHighlight = hPct.num >= aPct.num;
  const awayHighlight = aPct.num > hPct.num;

  return (
    <div className="py-3 border-b border-[#334155] last:border-0">
      <p className="text-sm font-medium text-white mb-2">{name}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 w-8">홈승</span>
          <div className="flex-1 h-4 rounded-full bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full ${homeHighlight ? "bg-emerald-500" : "bg-slate-500"}`}
              style={{ width: `${Math.min(hPct.num, 100)}%` }}
            />
          </div>
          <span className={`text-xs font-medium w-12 text-right ${homeHighlight ? "text-emerald-400" : "text-slate-400"}`}>
            {hPct.display}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 w-10">원정승</span>
          <div className="flex-1 h-4 rounded-full bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full ${awayHighlight ? "bg-emerald-500" : "bg-slate-500"}`}
              style={{ width: `${Math.min(aPct.num, 100)}%` }}
            />
          </div>
          <span className={`text-xs font-medium w-12 text-right ${awayHighlight ? "text-emerald-400" : "text-slate-400"}`}>
            {aPct.display}
          </span>
        </div>
      </div>
    </div>
  );
}

// --------------- blur overlay ---------------

function ProOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl"
         style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(2px)" }}>
      <span className="text-3xl">🔒</span>
      <p className="mt-2 text-sm font-bold text-white">프리미엄 전용 분석</p>
      <p className="mt-1 text-xs text-slate-400 text-center px-4">전술 분석 · 핵심 변수 · 상세 예측 데이터</p>
      <button
        onClick={() => alert("결제 기능 준비 중입니다. 곧 오픈 예정!")}
        className="mt-3 rounded-lg px-5 py-2 text-xs font-bold text-white cursor-pointer"
        style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}
      >
        Pro 시작하기
      </button>
    </div>
  );
}

function BlurCard({ title, locked, children }: { title: string; locked: boolean; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#334155] bg-[#1E293B] p-5">
      <h3 className="mb-4 text-base font-bold text-white">{title}</h3>
      {locked ? (
        <div className="pointer-events-none select-none" style={{ filter: "blur(12px)" }}>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// --------------- skeleton ---------------

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-5 w-32 rounded bg-slate-700" />
      <div className="rounded-xl border border-[#334155] bg-[#1E293B] p-5">
        <div className="mb-3 h-5 w-24 rounded-full bg-slate-700" />
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="h-12 w-12 rounded-full bg-slate-700" />
          <div className="h-6 w-40 rounded bg-slate-700" />
          <div className="h-12 w-12 rounded-full bg-slate-700" />
        </div>
        <div className="h-5 w-20 mx-auto rounded bg-slate-700" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-[#334155] bg-[#1E293B] p-5">
          <div className="h-5 w-28 rounded bg-slate-700 mb-3" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-slate-700" />
            <div className="h-4 w-3/4 rounded bg-slate-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

// --------------- model agreement label ---------------

function agreementLabel(value: string): string {
  if (!value) return "";
  if (value.includes("4/4") || value.includes("3/3")) return `${value} — 모든 모델 일치 ✅`;
  if (value.includes("3/4")) return `${value} — 대부분 일치`;
  return value;
}

// =============== main page ===============

export default function ReportPage() {
  const params = useParams<{ matchId: string }>();
  const matchId = params.matchId;

  const [match, setMatch] = useState<MatchPrediction | null>(null);
  const [report, setReport] = useState<MatchReport | null>(null);
  const [matchDetail, setMatchDetail] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
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

  // fetch match
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const res = await fetch(`/api/report/${matchId}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setMatch(json.match);
      setReport(json.report ?? null);
    } catch {
      setError("데이터를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch API-Football structured data
  useEffect(() => {
    const fid = match?.fixtureId?.trim();
    if (!fid) {
      console.log("[report] fixtureId is empty, skipping match-detail fetch. match:", match?.match, "fixtureId:", match?.fixtureId);
      return;
    }
    console.log("[report] Fetching match-detail for fixtureId:", fid);
    setDetailLoading(true);
    fetch(`/api/match-detail/${fid}`)
      .then(r => {
        if (!r.ok) { console.log("[report] match-detail API error:", r.status); return null; }
        return r.json();
      })
      .then(d => {
        if (d && !d.error) {
          console.log("[report] match-detail loaded:", Object.keys(d));
          setMatchDetail(d);
        } else {
          console.log("[report] match-detail empty or error:", d);
        }
      })
      .catch(err => console.log("[report] match-detail fetch failed:", err))
      .finally(() => setDetailLoading(false));
  }, [match?.fixtureId]);

  const isPro = userPlan === "pro";
  // 상세 분석 섹션은 모든 Free 유저에게 잠금 (확신도 무관)
  const locked = !isPro;

  // loading
  if (loading) {
    return (
      <main className="min-h-screen bg-[#0F172A] text-white">
        <Navbar />
        <AuthTabBar />
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 pb-24 md:pb-8">
          <Skeleton />
        </div>
      </main>
    );
  }

  // not found
  if (notFound) {
    return (
      <main className="min-h-screen bg-[#0F172A] text-white">
        <Navbar />
        <AuthTabBar />
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 pb-24 md:pb-8">
          <div className="rounded-xl border border-[#334155] bg-[#1E293B] p-10 text-center">
            <p className="mb-2 text-3xl">⚽</p>
            <p className="text-lg text-slate-300">경기를 찾을 수 없습니다</p>
            <Link
              href="/matches/today"
              className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"
            >
              홈으로
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // error
  if (error || !match) {
    return (
      <main className="min-h-screen bg-[#0F172A] text-white">
        <Navbar />
        <AuthTabBar />
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 pb-24 md:pb-8">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="text-red-400">{error ?? "알 수 없는 오류"}</p>
            <button
              onClick={fetchData}
              className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              다시 시도
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Newsletter layout when posting DB content is available
  if (report && (report.sections.length > 0 || report.leadingBlocks.length > 0)) {
    return <NewsletterReport match={match} report={report} locked={!!locked} matchDetail={matchDetail} detailLoading={detailLoading} />;
  }

  const [home, away] = splitTeams(match.match);

  // ensemble values
  const ensHome = parseFloat(match.ensemble.home) || 0;
  const ensDraw = parseFloat(match.ensemble.draw) || 0;
  const ensAway = parseFloat(match.ensemble.away) || 0;
  const maxEns = Math.max(ensHome, ensDraw, ensAway);

  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <Navbar />
      <AuthTabBar />
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 pb-24 md:pb-8 space-y-5">
        {/* ---- 1. back + date ---- */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href={`/matches/${match.date}`} style={{ fontSize: "14px", color: "#8494A7" }} className="hover:text-emerald-400 transition">
            ← 목록으로
          </Link>
          <span style={{ fontSize: "13px", color: "#566378" }}>{formatKoreanDate(match.date)}</span>
        </div>

        {/* ---- 2. match header ---- */}
        <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "14px", padding: "32px 24px", textAlign: "center" }}>
          {/* League */}
          <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
            <LeagueBadge league={match.league} />
          </div>

          {/* Teams */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <TeamLogo teamId={match.homeTeamId} teamName={home} size={72} />
              <span style={{ fontSize: "20px", fontWeight: 700, color: "#E1E7EF" }}>{home}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {match.result ? (
                <span style={{ fontSize: "28px", fontWeight: 700, color: "#E1E7EF", fontFamily: "'JetBrains Mono',monospace" }}>{match.result}</span>
              ) : (
                <span style={{ fontSize: "18px", fontWeight: 700, color: "#10B981" }}>VS</span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <TeamLogo teamId={match.awayTeamId} teamName={away} size={72} />
              <span style={{ fontSize: "20px", fontWeight: 700, color: "#E1E7EF" }}>{away}</span>
            </div>
          </div>

          {/* Confidence + prediction */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "14px", color: "#d4d4d4" }}>{match.confidenceLabel}</span>
            {match.prediction && (
              <span style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", borderRadius: "8px", padding: "4px 12px", fontSize: "13px", fontWeight: 700 }}>
                {match.prediction}
              </span>
            )}
          </div>

          {/* Result badge */}
          {(match.isCorrect === "적중" || match.isCorrect === "미적중") && (
            <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <ResultBadge isCorrect={match.isCorrect} />
            </div>
          )}
        </div>

        {/* ---- 3. AI prediction (always public) ---- */}
        <div className="rounded-xl border border-[#334155] bg-[#1E293B] p-5">
          <h3 className="mb-4 text-base font-bold text-white">AI 예측</h3>

          {/* prediction label */}
          <div className="mb-4 text-center">
            <span className="inline-block rounded-lg bg-emerald-500/20 px-4 py-2 text-lg font-bold text-emerald-400">
              {match.prediction}
            </span>
          </div>

          {/* ensemble bars */}
          <div className="space-y-2">
            <ProbBar label="홈승" value={match.ensemble.home} highlight={ensHome === maxEns && maxEns > 0} />
            <ProbBar label="무승부" value={match.ensemble.draw} highlight={ensDraw === maxEns && maxEns > 0} />
            <ProbBar label="원정승" value={match.ensemble.away} highlight={ensAway === maxEns && maxEns > 0} />
          </div>

          {/* score prediction */}
          {match.scorePrediction && (
            <div className="mt-4 text-center">
              <span className="text-sm text-slate-400">스코어 예측: </span>
              <span className="text-sm font-semibold text-white">{match.scorePrediction}</span>
            </div>
          )}
        </div>

        {/* ---- Structured data from API-Football (Free/Pro 공통) ---- */}
        {detailLoading ? (
          <MatchDetailSkeleton />
        ) : matchDetail && (
          <div className="space-y-5">
            <FormTable form={matchDetail.form} homeName={home} awayName={away} />
            <StatsTable stats={matchDetail.stats} homeName={home} awayName={away} />
            <H2HTable h2h={matchDetail.h2h} homeName={home} awayName={away} />
            <InjuriesList injuries={matchDetail.injuries} />
          </div>
        )}

        {/* ---- Pro sections (single overlay wrapper) ---- */}
        {locked ? (
          <div className="relative">
            <div className="space-y-5 pointer-events-none select-none" style={{ filter: "blur(10px)" }}>
              <BlurCard title="모델별 분석" locked={false}>
                <div className="divide-y divide-[#334155]">
                  <ModelRow name="푸아송 모델" home={match.poisson.home} away={match.poisson.away} />
                  <ModelRow name="ELO 레이팅" home={match.elo.home} away={match.elo.away} />
                  <ModelRow name="배당 역산" home={match.odds.home} away={match.odds.away} />
                  <ModelRow name="xG 기반" home={match.xg.home} away={match.xg.away} />
                </div>
              </BlurCard>
              <BlurCard title="AI 정성 분석" locked={false}>
                <div className="flex items-start gap-2">
                  <span className="text-lg shrink-0">🤖</span>
                  <p className="text-sm text-slate-300 leading-relaxed">분석 내용이 여기에 표시됩니다...</p>
                </div>
              </BlurCard>
              <BlurCard title="배당 분석" locked={false}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-[#0F172A] p-4 text-center">
                    <p className="text-xs text-slate-400 mb-1">홈승 배당</p>
                    <p className="text-xl font-bold text-white">-</p>
                  </div>
                  <div className="rounded-lg bg-[#0F172A] p-4 text-center">
                    <p className="text-xs text-slate-400 mb-1">원정승 배당</p>
                    <p className="text-xl font-bold text-white">-</p>
                  </div>
                </div>
              </BlurCard>
            </div>
            <ProOverlay />
          </div>
        ) : (
          <>
            {/* ---- 4. 4-model ensemble ---- */}
            <BlurCard title="모델별 분석" locked={false}>
              <div className="divide-y divide-[#334155]">
                <ModelRow name="푸아송 모델" home={match.poisson.home} away={match.poisson.away} />
                <ModelRow name="ELO 레이팅" home={match.elo.home} away={match.elo.away} />
                <ModelRow name="배당 역산" home={match.odds.home} away={match.odds.away} />
                <ModelRow name="xG 기반" home={match.xg.home} away={match.xg.away} />
              </div>
              {match.modelAgreement && (
                <div className="mt-4 rounded-lg bg-[#0F172A] px-4 py-3">
                  <span className="text-sm text-slate-400">모델 일치도: </span>
                  <span className="text-sm font-medium text-white">{agreementLabel(match.modelAgreement)}</span>
                </div>
              )}
            </BlurCard>

            {/* ---- 5. AI adjustment ---- */}
            <BlurCard title="AI 정성 분석" locked={false}>
              <div className="flex items-start gap-2">
                <span className="text-lg shrink-0">🤖</span>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {match.aiAdjustment || "AI 분석 데이터가 없습니다."}
                </p>
              </div>
            </BlurCard>

            {/* ---- 6. odds analysis ---- */}
            <BlurCard title="배당 분석" locked={false}>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-[#0F172A] p-4 text-center">
              <p className="text-xs text-slate-400 mb-1">홈승 배당</p>
              <p className="text-xl font-bold text-white">{match.odds.home || "-"}</p>
            </div>
            <div className="rounded-lg bg-[#0F172A] p-4 text-center">
              <p className="text-xs text-slate-400 mb-1">원정승 배당</p>
              <p className="text-xl font-bold text-white">{match.odds.away || "-"}</p>
            </div>
          </div>
          {match.prediction && match.odds.home && match.odds.away && (
            <div className="mt-3 text-center">
              {(() => {
                const h = parseFloat(match.odds.home) || 0;
                const a = parseFloat(match.odds.away) || 0;
                const oddsDirection = h < a ? "홈승" : "원정승";
                const aiMatch = match.prediction.includes(oddsDirection);
                return (
                  <span className={`text-sm ${aiMatch ? "text-emerald-400" : "text-amber-400"}`}>
                    {aiMatch ? "✅ 배당 방향과 AI 예측 일치" : "⚠️ 배당 방향과 AI 예측 불일치"}
                  </span>
                );
              })()}
            </div>
          )}
        </BlurCard>
          </>
        )}

        {/* ---- 7. transparency (always public) ---- */}
        <div className="rounded-xl border border-[#334155] bg-[#1E293B] p-5 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              LIVE DATA
            </span>
          </div>
          <p className="text-sm text-slate-400">
            이 분석은 Notion DB에 사전 기록되었습니다
          </p>
          <a
            href="https://matchlab13.notion.site"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs text-emerald-400 hover:underline"
          >
            Notion에서 검증하기 →
          </a>
        </div>
      </div>
    </main>
  );
}
