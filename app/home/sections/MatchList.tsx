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
  isBigMatch?: boolean;
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
        <svg key={i} width="18" height="18" viewBox="0 0 20 20" fill={i < count ? "#FBBF24" : "#334155"}>
          <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.69l5.34-.78z" />
        </svg>
      ))}
    </span>
  );
}

function handleProClick() {
  window.location.href = "/pricing";
}

function MatchCard({ match, locked }: { match: Match; locked: boolean }) {
  const isHigh = match.confidence >= 4;
  const [home, away] = splitTeams(match.match);

  // 3-column team row: [홈팀명 홈로고 | VS | 원정로고 원정팀명]
  const teamRow = (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "8px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", minWidth: 0 }}>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#E1E7EF", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{home}</span>
        <TeamLogo teamId={match.homeTeamId ?? ""} teamName={home} size={32} />
      </div>
      <span style={{ fontSize: "14px", fontWeight: 700, color: "#10B981", padding: "0 4px", flexShrink: 0 }}>VS</span>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "8px", minWidth: 0 }}>
        <TeamLogo teamId={match.awayTeamId ?? ""} teamName={away} size={32} />
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#E1E7EF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{away}</span>
      </div>
    </div>
  );

  if (locked) {
    return (
      <div
        onClick={handleProClick}
        className="rounded-xl cursor-pointer"
        style={{ background: "#1A2332", border: "2px solid #FBBF24", padding: "16px", marginBottom: "16px" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <LeagueBadge league={match.league} />
            {match.isBigMatch && <span style={{ background: "#EF444420", color: "#F87171", borderRadius: "6px", padding: "2px 6px", fontSize: "10px", fontWeight: 700 }}>🔥</span>}
          </div>
          <span style={{ background: "#FBBF2425", color: "#FBBF24", border: "1px solid #FBBF2450", borderRadius: "9999px", padding: "3px 10px", fontSize: "13px", fontWeight: 700 }}>
            🔒 Pro
          </span>
        </div>
        {teamRow}
      </div>
    );
  }

  return (
    <Link href={`/report/${match.id}`}>
      <div
        className="rounded-xl transition-colors hover:border-emerald-500/30"
        style={{
          background: "#1A2332",
          border: isHigh ? "1px solid #F59E0B44" : "1px solid #263344",
          borderLeft: isHigh ? "3px solid #FBBF24" : "1px solid #263344",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <LeagueBadge league={match.league} />
            {match.isBigMatch && <span style={{ background: "#EF444420", color: "#F87171", borderRadius: "6px", padding: "2px 6px", fontSize: "10px", fontWeight: 700 }}>🔥</span>}
          </div>
          <GoldStars count={match.confidence} />
        </div>
        {teamRow}
      </div>
    </Link>
  );
}

function SkeletonCards() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="rounded-xl animate-pulse" style={{ background: "#1A2332", padding: "16px", height: "80px" }} />
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

  useEffect(() => {
    setFadeIn(false);
    const t = requestAnimationFrame(() => setFadeIn(true));
    return () => cancelAnimationFrame(t);
  }, [selectedLeague]);

  return (
    <section id="match-list">
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
        <span style={{ fontSize: "16px" }}>⚽</span>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#E1E7EF" }}>오늘의 전체 경기</span>
      </div>

      {loading ? (
        <SkeletonCards />
      ) : matches.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", fontSize: "14px", color: "#566378" }}>
          오늘은 분석 경기가 없습니다
        </div>
      ) : (
        <>
          {leagues.length > 1 && (
            <div style={{ overflowX: "auto", marginBottom: "16px" }} className="scrollbar-hide">
              <div style={{ display: "flex", gap: "8px", flexWrap: "nowrap", paddingBottom: "4px" }}>
                <button
                  onClick={() => setSelectedLeague("전체")}
                  className="cursor-pointer"
                  style={{
                    flexShrink: 0, borderRadius: "9999px", padding: "6px 12px", fontSize: "12px", fontWeight: 500,
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
                    className="cursor-pointer"
                    style={{
                      flexShrink: 0, borderRadius: "9999px", padding: "6px 12px", fontSize: "12px", fontWeight: 500,
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

          <div style={{ opacity: fadeIn ? 1 : 0, transition: "opacity 0.2s" }}>
            {filtered.map(m => (
              <MatchCard
                key={m.id}
                match={m}
                locked={m.isProOnly && !isPro}
              />
            ))}

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "24px 0", fontSize: "13px", color: "#566378" }}>
                해당 리그의 경기가 없습니다
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
