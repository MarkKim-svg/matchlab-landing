"use client";

import { useEffect, useState } from "react";

interface MatchData {
  fixtureId: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  homeGoals: number | null;
  awayGoals: number | null;
  status: string;
  round: string;
}

interface Props {
  leagueId: string;
  season: string;
}

const ROUND_LABELS: Record<string, string> = {
  "Round of 16": "16강",
  "Quarter-finals": "8강",
  "Semi-finals": "4강",
  "Final": "결승",
};

function TeamRow({ name, logo, goals, isWinner }: { name: string; logo: string; goals: number | null; isWinner: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px",
      background: isWinner ? "rgba(16,185,129,0.08)" : "transparent",
      borderLeft: isWinner ? "3px solid #10B981" : "3px solid transparent",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
        <img src={logo} alt="" style={{ width: "20px", height: "20px", objectFit: "contain", flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        <span style={{ fontSize: "12px", fontWeight: isWinner ? 700 : 500, color: isWinner ? "#E1E7EF" : "#8494A7", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
      </div>
      <span style={{ fontSize: "14px", fontWeight: 700, color: "#E1E7EF", fontFamily: "'JetBrains Mono',monospace", marginLeft: "8px", flexShrink: 0 }}>
        {goals !== null ? goals : "-"}
      </span>
    </div>
  );
}

function MatchCard({ match }: { match: MatchData }) {
  const isFinished = match.status === "FT" || match.status === "AET" || match.status === "PEN";
  const hasScore = match.homeGoals !== null && match.awayGoals !== null;
  const homeWin = hasScore && (match.homeGoals ?? 0) > (match.awayGoals ?? 0);
  const awayWin = hasScore && (match.awayGoals ?? 0) > (match.homeGoals ?? 0);

  return (
    <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "10px", overflow: "hidden", width: "220px", flexShrink: 0 }}>
      <TeamRow name={match.homeTeam} logo={match.homeLogo} goals={match.homeGoals} isWinner={isFinished && homeWin} />
      <div style={{ height: "1px", background: "#334155" }} />
      <TeamRow name={match.awayTeam} logo={match.awayLogo} goals={match.awayGoals} isWinner={isFinished && awayWin} />
      <div style={{ background: "#0F172A", padding: "4px 10px", fontSize: "10px", color: "#566378", textAlign: "center" }}>
        {isFinished ? (match.status === "AET" ? "연장" : match.status === "PEN" ? "승부차기" : "종료") : match.date || "미정"}
      </div>
    </div>
  );
}

function TBD() {
  return (
    <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "10px", overflow: "hidden", width: "220px", flexShrink: 0, opacity: 0.5 }}>
      <div style={{ padding: "8px 10px", fontSize: "12px", color: "#566378" }}>미정</div>
      <div style={{ height: "1px", background: "#334155" }} />
      <div style={{ padding: "8px 10px", fontSize: "12px", color: "#566378" }}>미정</div>
    </div>
  );
}

export default function TournamentBracket({ leagueId, season }: Props) {
  const [rounds, setRounds] = useState<Record<string, MatchData[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tournament/${leagueId}?season=${season}`)
      .then(r => r.json())
      .then(d => setRounds(d.rounds ?? {}))
      .catch(() => setRounds({}))
      .finally(() => setLoading(false));
  }, [leagueId, season]);

  if (loading) {
    return (
      <div className="animate-pulse" style={{ display: "flex", gap: "24px", overflowX: "auto", padding: "16px 0" }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "12px", flexShrink: 0 }}>
            <div style={{ width: "220px", height: "80px", borderRadius: "10px", background: "#1A2332" }} />
            <div style={{ width: "220px", height: "80px", borderRadius: "10px", background: "#1A2332" }} />
          </div>
        ))}
      </div>
    );
  }

  const roundKeys = Object.keys(ROUND_LABELS).filter(k => rounds[k] && rounds[k].length > 0);

  if (roundKeys.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "#566378", fontSize: "14px" }}>
        토너먼트 데이터가 아직 없습니다
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto", padding: "8px 0" }} className="scrollbar-hide">
      <div style={{ display: "flex", gap: "32px", alignItems: "flex-start", minWidth: "fit-content" }}>
        {roundKeys.map(roundKey => {
          const matches = rounds[roundKey];
          const label = ROUND_LABELS[roundKey] ?? roundKey;

          return (
            <div key={roundKey} style={{ display: "flex", flexDirection: "column", gap: "12px", flexShrink: 0 }}>
              {/* Round header */}
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#10B981", textAlign: "center", marginBottom: "4px" }}>
                {label}
              </div>

              {/* Match cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", justifyContent: "center" }}>
                {matches.map((m, i) => (
                  <MatchCard key={m.fixtureId || i} match={m} />
                ))}
              </div>
            </div>
          );
        })}

        {/* TBD columns for missing rounds */}
        {!rounds["Final"] && roundKeys.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", flexShrink: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#566378", textAlign: "center", marginBottom: "4px" }}>결승</div>
            <TBD />
          </div>
        )}
      </div>
    </div>
  );
}
