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

const ROUND_ORDER = ["Round of 16", "Quarter-finals", "Semi-finals", "Final"];
const ROUND_LABELS: Record<string, string> = {
  "Round of 16": "16강",
  "Quarter-finals": "8강",
  "Semi-finals": "4강",
  "Final": "결승",
};

// ── Team Row ──
function TeamRow({ name, logo, goals, isWinner }: { name: string; logo: string; goals: number | null; isWinner: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "6px 10px",
      borderLeft: isWinner ? "3px solid #10B981" : "3px solid transparent",
      background: isWinner ? "rgba(16,185,129,0.06)" : "transparent",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: 0, flex: 1 }}>
        <img src={logo} alt="" style={{ width: "16px", height: "16px", objectFit: "contain", flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        <span style={{ fontSize: "11px", fontWeight: isWinner ? 700 : 500, color: isWinner ? "#E1E7EF" : "#8494A7", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
      </div>
      <span style={{ fontSize: "12px", fontWeight: 700, color: "#E1E7EF", fontFamily: "'JetBrains Mono',monospace", marginLeft: "6px", flexShrink: 0 }}>
        {goals !== null ? goals : "-"}
      </span>
    </div>
  );
}

// ── Match Card ──
function MatchCard({ match }: { match: MatchData }) {
  const fin = match.status === "FT" || match.status === "AET" || match.status === "PEN";
  const has = match.homeGoals !== null && match.awayGoals !== null;
  const hw = fin && has && (match.homeGoals ?? 0) > (match.awayGoals ?? 0);
  const aw = fin && has && (match.awayGoals ?? 0) > (match.homeGoals ?? 0);

  return (
    <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "8px", overflow: "hidden", width: "180px", flexShrink: 0 }}>
      <TeamRow name={match.homeTeam} logo={match.homeLogo} goals={match.homeGoals} isWinner={hw} />
      <div style={{ height: "1px", background: "#334155" }} />
      <TeamRow name={match.awayTeam} logo={match.awayLogo} goals={match.awayGoals} isWinner={aw} />
      <div style={{ background: "#0F172A", padding: "3px 8px", fontSize: "9px", color: "#566378", textAlign: "center" }}>
        {fin ? (match.status === "AET" ? "연장" : match.status === "PEN" ? "승부차기" : "종료") : match.date || "미정"}
      </div>
    </div>
  );
}

function TBDCard() {
  return (
    <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "8px", overflow: "hidden", width: "180px", flexShrink: 0, opacity: 0.4 }}>
      <div style={{ padding: "6px 10px", fontSize: "11px", color: "#566378" }}>미정</div>
      <div style={{ height: "1px", background: "#334155" }} />
      <div style={{ padding: "6px 10px", fontSize: "11px", color: "#566378" }}>미정</div>
    </div>
  );
}

// ── Bracket connector lines (CSS) ──
// Each pair of matches connects to one match in the next round
// We use ::before/::after pseudo-elements via inline styles

function BracketColumn({ matches, label, isLast }: { matches: MatchData[]; label: string; isLast: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flexShrink: 0, alignItems: "center" }}>
      {/* Round header */}
      <div style={{ fontSize: "12px", fontWeight: 700, color: "#10B981", marginBottom: "12px", textAlign: "center" }}>
        {label}
      </div>

      {/* Match cards with spacing for bracket alignment */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", flex: 1, gap: "0px" }}>
        {matches.map((m, i) => (
          <div key={m.fixtureId || i} style={{ display: "flex", alignItems: "center" }}>
            <MatchCard match={m} />
            {/* Connector line to right */}
            {!isLast && (
              <div style={{ width: "24px", height: "1px", background: "#334155", flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ConnectorColumn({ pairCount }: { pairCount: number }) {
  // Draws vertical + horizontal lines connecting pairs to single outputs
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", flex: 1, width: "24px", flexShrink: 0 }}>
      {Array.from({ length: pairCount }, (_, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, justifyContent: "center" }}>
          {/* Vertical bracket line */}
          <div style={{ width: "1px", height: "50%", background: "#334155" }} />
          {/* Horizontal output */}
          <div style={{ width: "24px", height: "1px", background: "#334155" }} />
          <div style={{ width: "1px", height: "50%", background: "#334155" }} />
        </div>
      ))}
    </div>
  );
}

// ── Main Component ──
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
      <div className="animate-pulse" style={{ display: "flex", gap: "32px", overflowX: "auto", padding: "16px 0" }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "16px", flexShrink: 0 }}>
            <div style={{ width: "180px", height: "60px", borderRadius: "8px", background: "#1A2332" }} />
            <div style={{ width: "180px", height: "60px", borderRadius: "8px", background: "#1A2332" }} />
          </div>
        ))}
      </div>
    );
  }

  const activeRounds = ROUND_ORDER.filter(k => rounds[k] && rounds[k].length > 0);

  if (activeRounds.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "#566378", fontSize: "14px" }}>
        토너먼트 데이터가 아직 없습니다
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto", padding: "8px 0" }} className="scrollbar-hide">
      <div style={{ display: "flex", alignItems: "stretch", minWidth: "fit-content", gap: "0px" }}>
        {activeRounds.map((roundKey, ri) => {
          const matches = rounds[roundKey];
          const label = ROUND_LABELS[roundKey] ?? roundKey;
          const isLast = ri === activeRounds.length - 1;
          const nextRound = activeRounds[ri + 1];
          const nextCount = nextRound ? (rounds[nextRound]?.length ?? 0) : 0;
          const pairCount = Math.floor(matches.length / 2);

          return (
            <div key={roundKey} style={{ display: "flex", alignItems: "stretch" }}>
              <BracketColumn matches={matches} label={label} isLast={isLast} />
              {/* Connector to next round */}
              {!isLast && pairCount > 0 && <ConnectorColumn pairCount={pairCount} />}
            </div>
          );
        })}

        {/* Trophy */}
        <div style={{ display: "flex", alignItems: "center", paddingLeft: "16px", flexShrink: 0 }}>
          <span style={{ fontSize: "32px" }}>🏆</span>
        </div>
      </div>
    </div>
  );
}
