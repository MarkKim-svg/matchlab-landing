"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TeamLogo, splitTeams } from "@/components/match-ui";

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

function stars(n: number) {
  return "⭐".repeat(n);
}

function MatchCard({ match, locked }: { match: Match; locked: boolean }) {
  const isHigh = match.confidence >= 4;
  const [home, away] = splitTeams(match.match);

  if (locked) {
    return (
      <div
        className="rounded-xl p-3 mb-2 flex justify-between items-center"
        style={{
          background: "#161616",
          border: "1px solid #404040",
        }}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <TeamLogo teamId={match.homeTeamId ?? ""} teamName={home} size={20} />
            <span className="text-[14px] font-semibold" style={{ color: "#737373" }}>{home}</span>
            <span className="text-[11px]" style={{ color: "#525252" }}>vs</span>
            <TeamLogo teamId={match.awayTeamId ?? ""} teamName={away} size={20} />
            <span className="text-[14px] font-semibold" style={{ color: "#737373" }}>{away}</span>
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: "#737373" }}>{match.league}</div>
        </div>
        <span className="text-[18px] ml-2 shrink-0" style={{ color: "#525252" }}>🔒</span>
      </div>
    );
  }

  const borderLeft = match.confidence === 5
    ? "3px solid #FBBF24"
    : match.confidence === 4
    ? "3px solid #F59E0B"
    : undefined;

  return (
    <Link href={`/report/${match.id}`}>
      <div
        className="rounded-xl p-3 mb-2 flex justify-between items-center min-h-[44px]"
        style={{
          background: "#1a1a1a",
          border: "1px solid #262626",
          borderLeft: borderLeft ?? "1px solid #262626",
        }}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <TeamLogo teamId={match.homeTeamId ?? ""} teamName={home} size={20} />
            <span className="text-[14px] font-semibold" style={{ color: "#e5e5e5" }}>{home}</span>
            <span className="text-[11px]" style={{ color: "#737373" }}>vs</span>
            <TeamLogo teamId={match.awayTeamId ?? ""} teamName={away} size={20} />
            <span className="text-[14px] font-semibold" style={{ color: "#e5e5e5" }}>{away}</span>
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: "#737373" }}>{match.league}</div>
        </div>
        <div className="text-right ml-2 shrink-0">
          <div className="font-mono-data text-[12px] font-bold" style={{ color: "#FBBF24" }}>{stars(match.confidence)}</div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCards() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="rounded-xl p-3 animate-pulse" style={{ background: "#1a1a1a", border: "1px solid #262626" }}>
          <div className="h-4 rounded w-48 mb-2" style={{ background: "#262626" }} />
          <div className="h-3 rounded w-24" style={{ background: "#262626" }} />
        </div>
      ))}
    </div>
  );
}

export default function MatchList({ predictions, loading, isPro }: Props) {
  const [selectedLeague, setSelectedLeague] = useState("전체");

  const matches = predictions?.matches ?? [];

  const leagues = useMemo(() => {
    const set = new Set(matches.map(m => m.league).filter(Boolean));
    return Array.from(set);
  }, [matches]);

  const filtered = useMemo(() => {
    if (selectedLeague === "전체") return matches;
    return matches.filter(m => m.league === selectedLeague);
  }, [matches, selectedLeague]);

  return (
    <section id="match-list" className="px-4 py-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[16px]">⚽</span>
        <span className="text-[14px] font-bold" style={{ color: "#d4d4d4" }}>오늘의 전체 경기</span>
      </div>

      {loading ? (
        <SkeletonCards />
      ) : matches.length === 0 ? (
        <div className="text-center py-8 text-[14px]" style={{ color: "#64748B" }}>
          오늘은 분석 경기가 없습니다
        </div>
      ) : (
        <>
          {/* League pills */}
          {leagues.length > 1 && (
            <div className="-mx-4 px-4 overflow-x-auto mb-3 scrollbar-hide">
              <div className="flex gap-2 flex-nowrap pb-1">
                <button
                  onClick={() => setSelectedLeague("전체")}
                  className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition cursor-pointer min-h-[34px]"
                  style={{
                    background: selectedLeague === "전체" ? "#10B981" : "transparent",
                    color: selectedLeague === "전체" ? "white" : "#a3a3a3",
                    border: selectedLeague === "전체" ? "1px solid #10B981" : "1px solid #333",
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
                      color: selectedLeague === league ? "white" : "#a3a3a3",
                      border: selectedLeague === league ? "1px solid #10B981" : "1px solid #333",
                    }}
                  >
                    {league}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Match cards */}
          {filtered.map(m => (
            <MatchCard
              key={m.id}
              match={m}
              locked={m.isProOnly && !isPro}
            />
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-6 text-[13px]" style={{ color: "#64748B" }}>
              해당 리그의 경기가 없습니다
            </div>
          )}
        </>
      )}
    </section>
  );
}
