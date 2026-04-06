"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { TeamLogo, LeagueBadge, splitTeams } from "@/components/match-ui";

interface Match {
  id: string;
  match: string;
  league: string;
  date: string;
  prediction: string;
  confidence: number;
  confidenceLabel: string;
  isProOnly: boolean;
  homeTeamId?: string;
  awayTeamId?: string;
}

interface Props {
  predictions: { matches: Match[] } | null;
  loading: boolean;
  isPro: boolean;
}

function GoldStars({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill={i < count ? "#FBBF24" : "#334155"}>
          <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.69l5.34-.78z" />
        </svg>
      ))}
    </span>
  );
}

function MatchCard({ match, locked }: { match: Match; locked: boolean }) {
  const isHigh = match.confidence >= 4;
  const [home, away] = splitTeams(match.match);

  if (locked) {
    return (
      <div
        className="rounded-xl p-3 mb-3"
        style={{ background: "#1A2332", border: "1px solid #263344" }}
      >
        {/* Row 1: League + Lock */}
        <div className="flex items-center justify-between mb-2">
          <LeagueBadge league={match.league} />
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ background: "#7C3AED22", color: "#A78BFA", border: "1px solid #7C3AED44" }}>
            🔒 Pro
          </span>
        </div>
        {/* Row 2: Teams centered */}
        <div className="flex items-center justify-center gap-2">
          <TeamLogo teamId={match.homeTeamId ?? ""} teamName={home} size={24} />
          <span className="text-[13px] font-semibold" style={{ color: "#737373" }}>{home}</span>
          <span className="text-[11px]" style={{ color: "#525252" }}>vs</span>
          <TeamLogo teamId={match.awayTeamId ?? ""} teamName={away} size={24} />
          <span className="text-[13px] font-semibold" style={{ color: "#737373" }}>{away}</span>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/report/${match.id}`}>
      <div
        className="rounded-xl p-3 mb-3 transition-colors hover:border-emerald-500/30"
        style={{
          background: "#1A2332",
          border: isHigh ? "1px solid #F59E0B44" : "1px solid #263344",
          borderLeft: isHigh ? "3px solid #FBBF24" : "1px solid #263344",
        }}
      >
        {/* Row 1: League + Stars */}
        <div className="flex items-center justify-between mb-2">
          <LeagueBadge league={match.league} />
          <GoldStars count={match.confidence} />
        </div>
        {/* Row 2: Teams centered */}
        <div className="flex items-center justify-center gap-2">
          <TeamLogo teamId={match.homeTeamId ?? ""} teamName={home} size={24} />
          <span className="text-[13px] font-bold" style={{ color: "#E1E7EF" }}>{home}</span>
          <span className="text-[11px]" style={{ color: "#8494A7" }}>vs</span>
          <TeamLogo teamId={match.awayTeamId ?? ""} teamName={away} size={24} />
          <span className="text-[13px] font-bold" style={{ color: "#E1E7EF" }}>{away}</span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCards() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="rounded-xl p-3 animate-pulse" style={{ background: "#1A2332" }}>
          <div className="h-4 rounded w-48 mb-2" style={{ background: "#263344" }} />
          <div className="h-3 rounded w-24" style={{ background: "#263344" }} />
        </div>
      ))}
    </div>
  );
}

export default function MatchList({ predictions, loading, isPro }: Props) {
  const [selectedLeague, setSelectedLeague] = useState("전체");
  const [fadeIn, setFadeIn] = useState(true);

  const matches = predictions?.matches ?? [];

  const leagues = useMemo(() => {
    const set = new Set(matches.map(m => m.league).filter(Boolean));
    return Array.from(set);
  }, [matches]);

  const filtered = useMemo(() => {
    if (selectedLeague === "전체") return matches;
    return matches.filter(m => m.league === selectedLeague);
  }, [matches, selectedLeague]);

  // Fade transition on league switch
  useEffect(() => {
    setFadeIn(false);
    const t = requestAnimationFrame(() => setFadeIn(true));
    return () => cancelAnimationFrame(t);
  }, [selectedLeague]);

  return (
    <section id="match-list">
      <div className="flex items-center gap-1.5 mb-4">
        <span className="text-[16px]">⚽</span>
        <span className="text-[14px] font-bold text-bg-100">오늘의 전체 경기</span>
      </div>

      {loading ? (
        <SkeletonCards />
      ) : matches.length === 0 ? (
        <div className="text-center py-8 text-[14px] text-text-muted">
          오늘은 분석 경기가 없습니다
        </div>
      ) : (
        <>
          {/* League pills */}
          {leagues.length > 1 && (
            <div className="-mx-5 px-5 overflow-x-auto mb-3 scrollbar-hide">
              <div className="flex gap-2 flex-nowrap pb-1">
                <button
                  onClick={() => setSelectedLeague("전체")}
                  className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition cursor-pointer min-h-[34px]"
                  style={{
                    background: selectedLeague === "전체" ? "#10B981" : "transparent",
                    color: selectedLeague === "전체" ? "white" : "#8494A7",
                    border: selectedLeague === "전체" ? "1px solid #10B981" : "1px solid #263344",
                  }}
                >
                  전체
                </button>
                {leagues.map(league => (
                  <button
                    key={league}
                    onClick={() => setSelectedLeague(league)}
                    className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition cursor-pointer min-h-[34px]"
                    style={{
                      background: selectedLeague === league ? "#10B981" : "transparent",
                      color: selectedLeague === league ? "white" : "#8494A7",
                      border: selectedLeague === league ? "1px solid #10B981" : "1px solid #263344",
                    }}
                  >
                    {league}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Match cards with fade transition */}
          <div
            className="transition-opacity duration-200"
            style={{ opacity: fadeIn ? 1 : 0 }}
          >
            {filtered.map(m => (
              <MatchCard
                key={m.id}
                match={m}
                locked={m.isProOnly && !isPro}
              />
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-6 text-[13px] text-text-muted">
                해당 리그의 경기가 없습니다
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
