"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LEAGUE_CONFIG } from "@/lib/constants";
import Navbar from "@/components/Navbar";
import AuthTabBar from "@/components/AuthTabBar";
import { TeamLogo, LeagueBadge, ResultBadge, splitTeams, getKSTToday, formatKoreanDate, fmtPct } from "@/components/match-ui";
import DarkCalendar from "@/components/DarkCalendar";
import type { MatchPrediction } from "@/lib/notion";

// ── helpers ──

function resolveDate(param: string): string {
  return param === "today" ? getKSTToday() : param;
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function getBestEnsemble(p: MatchPrediction): { label: string; pct: string } {
  const home = fmtPct(p.ensemble.home);
  const away = fmtPct(p.ensemble.away);
  const draw = fmtPct(p.ensemble.draw);
  const max = Math.max(home.num, away.num, draw.num);
  if (max === 0) return { label: p.prediction, pct: "" };
  if (max === home.num) return { label: "홈승", pct: home.display };
  if (max === away.num) return { label: "원정승", pct: away.display };
  return { label: "무승부", pct: draw.display };
}

const CONF_SECTIONS = [
  { stars: 5, label: "⭐⭐⭐⭐⭐", sub: "최고 확신" },
  { stars: 4, label: "⭐⭐⭐⭐", sub: "높은 확신" },
  { stars: 3, label: "⭐⭐⭐", sub: "보통" },
  { stars: 2, label: "⭐⭐", sub: "낮음" },
  { stars: 1, label: "⭐", sub: "최저" },
];

const LEAGUE_TABS = [
  { key: "epl", name: "프리미어리그", short: "EPL" },
  { key: "laliga", name: "라리가", short: "라리가" },
  { key: "seriea", name: "세리에A", short: "세리에A" },
  { key: "bundesliga", name: "분데스리가", short: "분데스" },
  { key: "ligue1", name: "리그1", short: "리그1" },
  { key: "ucl", name: "챔피언스리그", short: "UCL" },
  { key: "uel", name: "유로파리그", short: "UEL" },
  { key: "uecl", name: "컨퍼런스리그", short: "UECL" },
  { key: "facup", name: "FA컵", short: "FA컵" },
  { key: "copadelrey", name: "코파델레이", short: "코파" },
  { key: "coppaitalia", name: "코파이탈리아", short: "코파IT" },
  { key: "dfbpokal", name: "DFB포칼", short: "DFB" },
  { key: "coupedefrance", name: "쿠프드프랑스", short: "쿠프" },
];

interface ApiFixture {
  id: string;
  date: string;
  time?: string;
  kickoffUTC?: string;
  league?: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: string;
  awayTeamId: string;
  homeLogo: string;
  awayLogo: string;
  homeGoals: number | null;
  awayGoals: number | null;
  status: string;
  round: string;
  hasPrediction: boolean;
}

function FixtureCard({ f }: { f: ApiFixture }) {
  const isFinished = f.status === "FT" || f.status === "AET" || f.status === "PEN";
  const hasScore = f.homeGoals !== null && f.awayGoals !== null;

  // KST time from kickoffUTC or time field
  let timeLabel = f.time ? `${f.time}` : "";
  if (!timeLabel && f.kickoffUTC) {
    try {
      const d = new Date(f.kickoffUTC);
      const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
      timeLabel = `${String(kst.getUTCHours()).padStart(2, "0")}:${String(kst.getUTCMinutes()).padStart(2, "0")}`;
    } catch { /* skip */ }
  }

  return (
    <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "12px", padding: "16px" }}>
      {/* Row 1: League + Round + time */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <span style={{ fontSize: "11px", color: "#566378" }}>{f.league || ""} {f.round || ""}</span>
        {timeLabel && <span style={{ fontSize: "11px", color: "#566378" }}>{timeLabel} KST</span>}
      </div>

      {/* Row 2: Teams + Score/VS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#E1E7EF", textAlign: "right" }}>{f.homeTeam}</span>
          <img src={f.homeLogo} alt="" style={{ width: "40px", height: "40px", objectFit: "contain" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        {isFinished && hasScore ? (
          <span style={{ fontSize: "22px", fontWeight: 700, color: "#E1E7EF", padding: "0 8px", fontFamily: "'JetBrains Mono',monospace" }}>
            {f.homeGoals} : {f.awayGoals}
          </span>
        ) : (
          <span style={{ fontSize: "15px", fontWeight: 700, color: "#10B981", padding: "0 8px" }}>VS</span>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "8px" }}>
          <img src={f.awayLogo} alt="" style={{ width: "40px", height: "40px", objectFit: "contain" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#E1E7EF" }}>{f.awayTeam}</span>
        </div>
      </div>

      {/* Row 3: Status */}
      <div style={{ textAlign: "center", marginTop: "8px" }}>
        {isFinished ? (
          <span style={{ fontSize: "11px", color: "#566378" }}>종료</span>
        ) : (
          <span style={{ fontSize: "11px", color: "#F59E0B" }}>⏳ 분석 준비중</span>
        )}
      </div>
    </div>
  );
}

// ── Match Card Component ──

function MatchCard({ m, locked, isPro, showDate }: { m: MatchPrediction; locked: boolean; isPro: boolean; showDate?: boolean }) {
  const [home, away] = splitTeams(m.match);
  const best = getBestEnsemble(m);
  const leagueColor = LEAGUE_CONFIG[m.league]?.color ?? "#334155";
  const hasResult = m.result && m.result !== "";
  const isJudged = m.isCorrect === "적중" || m.isCorrect === "미적중";

  const cardStyle = {
    borderLeftColor: leagueColor,
    backgroundImage: `linear-gradient(to bottom, ${leagueColor}18, transparent 6px)`,
  };

  const inner = (
    <div
      className="rounded-xl border border-[#334155] border-l-4 p-5 transition hover:border-emerald-500/40"
      style={{ background: "#1E293B", ...cardStyle }}
    >
      {/* Row 1: League + confidence */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <LeagueBadge league={m.league} />
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {showDate && <span style={{ fontSize: "11px", color: "#566378" }}>{m.date}</span>}
          <span style={{ fontSize: "12px", color: "#8494A7" }}>{m.confidenceLabel}</span>
        </div>
      </div>

      {/* Row 2: Teams + Score/VS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
          <span style={{ fontSize: "18px", fontWeight: 700, color: "#E1E7EF", textAlign: "right" }}>{home}</span>
          <TeamLogo teamId={m.homeTeamId} teamName={home} size={44} />
        </div>
        {hasResult ? (
          <span style={{ fontSize: "20px", fontWeight: 700, color: "#E1E7EF", padding: "0 8px", fontFamily: "'JetBrains Mono',monospace" }}>
            {m.result}
          </span>
        ) : (
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#10B981", padding: "0 8px" }}>VS</span>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "8px" }}>
          <TeamLogo teamId={m.awayTeamId} teamName={away} size={44} />
          <span style={{ fontSize: "18px", fontWeight: 700, color: "#E1E7EF" }}>{away}</span>
        </div>
      </div>

      {/* Row 3: Prediction + Result badge */}
      {locked ? (
        <div className="relative" style={{ minHeight: "40px" }}>
          <div className="pointer-events-none select-none" style={{ filter: "blur(8px)", textAlign: "center" }}>
            <span style={{ fontSize: "13px", color: "#10B981" }}>{best.label} {best.pct}</span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); alert("결제 기능 준비 중입니다. 곧 오픈 예정!"); }}
              className="cursor-pointer"
              style={{ background: "linear-gradient(135deg, #d97706, #b45309)", color: "white", fontWeight: 700, fontSize: "12px", padding: "4px 12px", borderRadius: "8px", border: "none" }}
            >
              🔒 Pro 전용
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#10B981" }}>
            AI: {best.label} {best.pct}
          </span>
          {isJudged && <ResultBadge isCorrect={m.isCorrect} />}
        </div>
      )}
    </div>
  );

  if (locked) return <div>{inner}</div>;
  return <Link href={`/report/${m.id}`}>{inner}</Link>;
}

// ── Skeleton ──

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-[#334155] bg-[#1E293B] p-5">
      <div className="mb-3 h-5 w-24 rounded-full bg-slate-700" />
      <div className="mb-3 flex items-center justify-center gap-4">
        <div className="h-9 w-9 rounded-full bg-slate-700" />
        <div className="h-5 w-32 rounded bg-slate-700" />
        <div className="h-9 w-9 rounded-full bg-slate-700" />
      </div>
      <div className="flex justify-center"><div className="h-4 w-24 rounded bg-slate-700" /></div>
    </div>
  );
}

// =============== Main Page ===============

export default function MatchesDatePage() {
  const params = useParams<{ date: string }>();
  const router = useRouter();

  const dateStr = resolveDate(params.date);
  const isToday = dateStr === getKSTToday();

  const [viewTab, setViewTab] = useState<"date" | "league">("date");
  const [matches, setMatches] = useState<MatchPrediction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [proCount, setProCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [selectedLeague, setSelectedLeague] = useState<string>("전체");
  const [dateFixtures, setDateFixtures] = useState<ApiFixture[]>([]);

  // League tab state
  const [leagueTab, setLeagueTab] = useState("epl");
  const [leagueMonth, setLeagueMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [leagueMatches, setLeagueMatches] = useState<MatchPrediction[]>([]);
  const [leagueFixtures, setLeagueFixtures] = useState<ApiFixture[]>([]);
  const [leagueLoading, setLeagueLoading] = useState(false);

  // Auth
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
      if (data?.plan) setUserPlan(data.plan);
    }
    checkAuth();
  }, []);

  // Fetch date predictions + API-Football fixtures
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [predRes, fxRes] = await Promise.all([
        fetch(`/api/predictions/${dateStr}`),
        fetch(`/api/fixtures/${dateStr}`).catch(() => null),
      ]);
      if (!predRes.ok) throw new Error("Failed");
      const predJson = await predRes.json();
      const preds: MatchPrediction[] = predJson.matches ?? [];
      setMatches(preds);
      setTotalCount(predJson.totalCount ?? 0);
      setProCount(predJson.proCount ?? 0);

      // Merge fixtures — exclude already-predicted matches
      if (fxRes?.ok) {
        const fxJson = await fxRes.json();
        const predictedSet = new Set(preds.map(p => `${p.homeTeamId}-${p.awayTeamId}`));
        const unpredicted = (fxJson.fixtures ?? []).filter((f: ApiFixture) =>
          !predictedSet.has(`${f.homeTeamId}-${f.awayTeamId}`)
        );
        setDateFixtures(unpredicted);
      } else {
        setDateFixtures([]);
      }
    } catch {
      setError("데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setSelectedLeague("전체"); }, [dateStr]);

  // Fetch league predictions + fixtures (with month)
  useEffect(() => {
    if (viewTab !== "league") return;
    setLeagueLoading(true);
    fetch(`/api/predictions/league/${leagueTab}?month=${leagueMonth}`)
      .then(r => r.json())
      .then(d => {
        setLeagueMatches(d.matches ?? []);
        setLeagueFixtures(d.fixtures ?? []);
      })
      .catch(() => { setLeagueMatches([]); setLeagueFixtures([]); })
      .finally(() => setLeagueLoading(false));
  }, [viewTab, leagueTab, leagueMonth]);

  const isPro = userPlan === "pro";

  // Date tab helpers
  const leagues = useMemo(() => Array.from(new Set(matches.map(m => m.league).filter(Boolean))), [matches]);
  const filteredMatches = useMemo(() => selectedLeague === "전체" ? matches : matches.filter(m => m.league === selectedLeague), [matches, selectedLeague]);
  const goDate = (d: string) => router.push(`/matches/${d}`);
  const grouped = CONF_SECTIONS.map(sec => ({ ...sec, matches: filteredMatches.filter(m => m.confidence === sec.stars) })).filter(g => g.matches.length > 0);

  // Date tab accuracy summary
  const judged = filteredMatches.filter(m => m.isCorrect === "적중" || m.isCorrect === "미적중");
  const correct = judged.filter(m => m.isCorrect === "적중").length;

  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <Navbar />
      <AuthTabBar />
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 pb-24 md:pb-8">

        {/* ── View tabs ── */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {([
            { key: "date" as const, label: "📅 날짜별" },
            { key: "league" as const, label: "🏆 리그별" },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setViewTab(t.key)}
              className="cursor-pointer"
              style={{
                padding: "8px 16px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, border: "none",
                background: viewTab === t.key ? "#10B981" : "#1E293B",
                color: viewTab === t.key ? "white" : "#8494A7",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ════════ TAB 1: 날짜별 ════════ */}
        {viewTab === "date" && (
          <>
            {/* Date nav */}
            <div className="mb-6">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button onClick={() => goDate(shiftDate(dateStr, -1))} className="rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-sm text-slate-300 transition hover:border-emerald-500/50 hover:text-white">← 이전</button>
                <div className="text-center">
                  <DarkCalendar
                    value={dateStr}
                    onChange={goDate}
                    label={formatKoreanDate(dateStr)}
                  />
                </div>
                <button onClick={() => goDate(shiftDate(dateStr, 1))} className="rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-sm text-slate-300 transition hover:border-emerald-500/50 hover:text-white">다음 →</button>
              </div>

              {!loading && !error && (
                <p className="mt-3 text-center text-sm text-slate-400">
                  총 <span className="text-white font-semibold">{totalCount}</span>경기
                  {proCount > 0 && <> · <span className="text-amber-400 font-semibold">Pro {proCount}</span>경기</>}
                  {judged.length > 0 && (
                    <> · 적중률 <span className="text-emerald-400 font-semibold">{correct}/{judged.length} ({Math.round((correct / judged.length) * 100)}%)</span></>
                  )}
                </p>
              )}
            </div>

            {/* League filter */}
            {!loading && !error && leagues.length > 1 && (
              <div style={{ overflowX: "auto", marginBottom: "20px" }} className="scrollbar-hide">
                <div style={{ display: "flex", gap: "8px", flexWrap: "nowrap" }}>
                  <button onClick={() => setSelectedLeague("전체")} className="cursor-pointer" style={{ flexShrink: 0, borderRadius: "9999px", padding: "6px 12px", fontSize: "12px", fontWeight: 500, background: selectedLeague === "전체" ? "#059669" : "#1E293B", color: selectedLeague === "전체" ? "white" : "#8494A7", border: "none" }}>전체</button>
                  {leagues.map(league => {
                    const config = LEAGUE_CONFIG[league];
                    return (
                      <button key={league} onClick={() => setSelectedLeague(league)} className="cursor-pointer" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "9999px", padding: "6px 12px", fontSize: "12px", fontWeight: 500, background: selectedLeague === league ? "#059669" : "#1E293B", color: selectedLeague === league ? "white" : "#8494A7", border: "none" }}>
                        {config && <img src={config.logo} alt={league} width={16} height={16} className="rounded-full bg-white p-0.5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                        {league}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* States */}
            {loading && <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</div>}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
                <p className="text-red-400">{error}</p>
                <button onClick={fetchData} className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500">다시 시도</button>
              </div>
            )}
            {!loading && !error && matches.length === 0 && dateFixtures.length === 0 && (
              <div className="rounded-xl border border-[#334155] bg-[#1E293B] p-10 text-center">
                <p className="mb-2 text-3xl">⚽</p>
                <p className="text-lg text-slate-300">이 날짜에 예정된 경기가 없습니다</p>
              </div>
            )}

            {/* Match groups */}
            {!loading && !error && grouped.map(group => (
              <section key={group.stars} style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#E1E7EF" }}>
                    {group.label} <span style={{ fontSize: "14px", fontWeight: 400, color: "#8494A7" }}>{group.sub}</span>
                  </h2>
                  {group.stars >= 4 && (
                    <span style={{ background: "#F59E0B25", color: "#FBBF24", borderRadius: "9999px", padding: "2px 8px", fontSize: "10px", fontWeight: 700 }}>PRO</span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {group.matches.map(m => (
                    <MatchCard key={m.id} m={m} locked={m.isProOnly && !isPro} isPro={isPro} />
                  ))}
                </div>
              </section>
            ))}

            {/* Unanalyzed fixtures from API-Football */}
            {!loading && !error && dateFixtures.length > 0 && (
              <section style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#8494A7" }}>
                    🔬 기타 경기 <span style={{ fontSize: "14px", fontWeight: 400 }}>({dateFixtures.length}경기)</span>
                  </h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {dateFixtures.map(f => (
                    <FixtureCard key={f.id} f={f} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ════════ TAB 2: 리그별 ════════ */}
        {viewTab === "league" && (
          <>
            {/* League selector */}
            <div style={{ overflowX: "auto", marginBottom: "16px" }} className="scrollbar-hide">
              <div style={{ display: "flex", gap: "8px", flexWrap: "nowrap" }}>
                {LEAGUE_TABS.map(l => {
                  const config = LEAGUE_CONFIG[l.name];
                  return (
                    <button key={l.key} onClick={() => setLeagueTab(l.key)} className="cursor-pointer" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "12px", padding: "8px 14px", fontSize: "13px", fontWeight: 600, background: leagueTab === l.key ? "rgba(16,185,129,0.15)" : "#1E293B", color: leagueTab === l.key ? "#34D399" : "#8494A7", border: leagueTab === l.key ? "1px solid rgba(16,185,129,0.4)" : "1px solid #334155" }}>
                      {config && <img src={config.logo} alt={l.name} width={18} height={18} className="rounded-full bg-white p-0.5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                      {l.short}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Month nav */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "24px" }}>
              <button
                onClick={() => {
                  const [y, m] = leagueMonth.split("-").map(Number);
                  const prev = new Date(y, m - 2, 1);
                  setLeagueMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`);
                }}
                className="cursor-pointer"
                style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "8px", padding: "6px 12px", color: "#8494A7", fontSize: "14px" }}
              >
                ◀
              </button>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#E1E7EF" }}>
                {(() => { const [y, m] = leagueMonth.split("-"); return `${y}년 ${parseInt(m)}월`; })()}
              </span>
              <button
                onClick={() => {
                  const [y, m] = leagueMonth.split("-").map(Number);
                  const next = new Date(y, m, 1);
                  setLeagueMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`);
                }}
                className="cursor-pointer"
                style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "8px", padding: "6px 12px", color: "#8494A7", fontSize: "14px" }}
              >
                ▶
              </button>
            </div>

            {/* League matches grouped by date */}
            {leagueLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</div>
            ) : leagueMatches.length === 0 && leagueFixtures.length === 0 ? (
              <div className="rounded-xl border border-[#334155] bg-[#1E293B] p-10 text-center">
                <p className="mb-2 text-3xl">⚽</p>
                <p className="text-lg text-slate-300">이 달에 해당 리그의 경기가 없습니다</p>
              </div>
            ) : (
              (() => {
                // Merge predictions + fixtures by date
                type DayItem = { type: "prediction"; data: MatchPrediction } | { type: "fixture"; data: ApiFixture };
                const byDate = new Map<string, DayItem[]>();

                for (const m of leagueMatches) {
                  const list = byDate.get(m.date) ?? [];
                  list.push({ type: "prediction", data: m });
                  byDate.set(m.date, list);
                }
                for (const f of leagueFixtures) {
                  const list = byDate.get(f.date) ?? [];
                  list.push({ type: "fixture", data: f });
                  byDate.set(f.date, list);
                }

                const sortedDates = Array.from(byDate.keys()).sort((a, b) => b.localeCompare(a));

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {sortedDates.map(date => {
                      const items = byDate.get(date)!;
                      const d = new Date(date + "T00:00:00");
                      const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
                      const dayLabel = `${parseInt(date.split("-")[1])}월 ${parseInt(date.split("-")[2])}일 (${dayNames[d.getDay()]})`;

                      return (
                        <div key={date}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                            <span style={{ fontSize: "15px", fontWeight: 700, color: "#E1E7EF" }}>{dayLabel}</span>
                            <div style={{ flex: 1, height: "1px", background: "#1E2D47" }} />
                            <span style={{ fontSize: "12px", color: "#566378" }}>{items.length}경기</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {items.map(item =>
                              item.type === "prediction" ? (
                                <MatchCard key={item.data.id} m={item.data} locked={item.data.isProOnly && !isPro} isPro={isPro} />
                              ) : (
                                <FixtureCard key={item.data.id} f={item.data} />
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </>
        )}
      </div>
    </main>
  );
}
