"use client";

import { useEffect, useState, useRef } from "react";

interface TieData {
  team1: string;
  team2: string;
  team1Logo: string;
  team2Logo: string;
  leg1: { home: number | null; away: number | null; status: string; date: string; kickoffUTC?: string } | null;
  leg2: { home: number | null; away: number | null; status: string; date: string; kickoffUTC?: string } | null;
  aggTeam1: number;
  aggTeam2: number;
  winner: string | null;
  finished: boolean;
  firstFixtureId?: number;
}

function formatKSTShort(utc: string): string {
  if (!utc) return "";
  try {
    const d = new Date(utc);
    const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const m = kst.getUTCMonth() + 1;
    const dd = kst.getUTCDate();
    const day = dayNames[kst.getUTCDay()];
    const hh = String(kst.getUTCHours()).padStart(2, "0");
    const mm = String(kst.getUTCMinutes()).padStart(2, "0");
    return `${m}/${dd} (${day}) ${hh}:${mm}`;
  } catch { return ""; }
}

interface Props { leagueId: string; season: string; }

const LABELS: Record<string, string> = { R16: "16강", QF: "8강", SF: "4강", F: "결승" };

const LEAGUE_LOGOS: Record<string, { logo: string; name: string }> = {
  "2": { logo: "https://media.api-sports.io/football/leagues/2.png", name: "챔피언스리그" },
  "3": { logo: "https://media.api-sports.io/football/leagues/3.png", name: "유로파리그" },
  "848": { logo: "https://media.api-sports.io/football/leagues/848.png", name: "컨퍼런스리그" },
  "45": { logo: "https://media.api-sports.io/football/leagues/45.png", name: "FA컵" },
  "143": { logo: "https://media.api-sports.io/football/leagues/143.png", name: "코파 델 레이" },
  "137": { logo: "https://media.api-sports.io/football/leagues/137.png", name: "코파 이탈리아" },
  "81": { logo: "https://media.api-sports.io/football/leagues/81.png", name: "DFB 포칼" },
  "66": { logo: "https://media.api-sports.io/football/leagues/66.png", name: "쿠프 드 프랑스" },
};

// ── Tie Card ──
function TieCard({ tie, mirror }: { tie: TieData; mirror?: boolean }) {
  const t1Win = tie.winner === tie.team1;
  const t2Win = tie.winner === tie.team2;
  const hasLeg2 = tie.leg2 !== null;

  function Row({ name, logo, agg, isWin }: { name: string; logo: string; agg: number; isWin: boolean }) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 8px",
        borderLeft: !mirror && isWin ? "3px solid #10B981" : !mirror ? "3px solid transparent" : undefined,
        borderRight: mirror && isWin ? "3px solid #10B981" : mirror ? "3px solid transparent" : undefined,
        background: isWin ? "rgba(16,185,129,0.06)" : "transparent",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: 0, flex: 1, flexDirection: mirror ? "row-reverse" : "row" }}>
          <img src={logo} alt="" style={{ width: "16px", height: "16px", objectFit: "contain", flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <span style={{ fontSize: "11px", fontWeight: isWin ? 700 : 500, color: isWin ? "#E1E7EF" : "#8494A7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
        </div>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#E1E7EF", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0, marginLeft: mirror ? 0 : "6px", marginRight: mirror ? "6px" : 0 }}>
          {tie.finished ? agg : "-"}
        </span>
      </div>
    );
  }

  const nextKickoff = !tie.finished ? (tie.leg2?.kickoffUTC || tie.leg1?.kickoffUTC || "") : "";
  const nextLabel = nextKickoff ? formatKSTShort(nextKickoff) : (!tie.finished ? (tie.leg2?.date || tie.leg1?.date || "미정") : "");

  return (
    <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "8px", overflow: "hidden", width: "170px", flexShrink: 0 }}>
      <Row name={tie.team1} logo={tie.team1Logo} agg={tie.aggTeam1} isWin={t1Win} />
      <div style={{ height: "1px", background: "#334155" }} />
      <Row name={tie.team2} logo={tie.team2Logo} agg={tie.aggTeam2} isWin={t2Win} />
      <div style={{ background: "#0F172A", padding: "2px 8px", fontSize: "9px", color: "#566378", textAlign: "center" }}>
        {tie.finished ? (hasLeg2 ? "합산" : "종료") : nextLabel || "미정"}
      </div>
    </div>
  );
}

function TBDCard() {
  return (
    <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "8px", width: "170px", flexShrink: 0, opacity: 0.35 }}>
      <div style={{ padding: "5px 8px", fontSize: "11px", color: "#566378" }}>미정</div>
      <div style={{ height: "1px", background: "#334155" }} />
      <div style={{ padding: "5px 8px", fontSize: "11px", color: "#566378" }}>미정</div>
    </div>
  );
}

// ── Bracket Column ──
function BracketCol({ ties, label, mirror, connector }: { ties: TieData[]; label: string; mirror?: boolean; connector?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ fontSize: "11px", fontWeight: 700, color: "#10B981", textAlign: "center", marginBottom: "8px" }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", flex: 1, gap: "8px" }}>
        {ties.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flexDirection: mirror ? "row-reverse" : "row" }}>
            <TieCard tie={t} mirror={mirror} />
            {connector && <div style={{ width: "16px", height: "1px", background: "#334155", flexShrink: 0 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function Connector({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", flex: 1, width: "16px", flexShrink: 0 }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, justifyContent: "center" }}>
          <div style={{ width: "1px", flex: 1, background: "#334155" }} />
          <div style={{ width: "16px", height: "1px", background: "#334155" }} />
          <div style={{ width: "1px", flex: 1, background: "#334155" }} />
        </div>
      ))}
    </div>
  );
}

// ── Main ──
export default function TournamentBracket({ leagueId, season }: Props) {
  const [rounds, setRounds] = useState<Record<string, TieData[]>>({});
  const [loading, setLoading] = useState(true);
  const bracketRef = useRef<HTMLDivElement>(null);

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
      <div className="animate-pulse" style={{ display: "flex", justifyContent: "center", gap: "24px", padding: "24px 0" }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ width: "170px", height: "80px", borderRadius: "8px", background: "#1A2332", flexShrink: 0 }} />
        ))}
      </div>
    );
  }

  const r16 = rounds["R16"] ?? [];
  const qf = rounds["QF"] ?? [];
  const sf = rounds["SF"] ?? [];
  const f = rounds["F"] ?? [];

  const hasData = r16.length > 0 || qf.length > 0 || sf.length > 0 || f.length > 0;
  if (!hasData) {
    return <div style={{ textAlign: "center", padding: "40px 0", color: "#566378", fontSize: "14px" }}>토너먼트 데이터가 아직 없습니다</div>;
  }

  // Split into left half / right half for mirror bracket
  const splitHalf = (arr: TieData[]) => {
    const mid = Math.ceil(arr.length / 2);
    return [arr.slice(0, mid), arr.slice(mid)];
  };

  const [r16L, r16R] = splitHalf(r16);
  const [qfL, qfR] = splitHalf(qf);
  const [sfL, sfR] = splitHalf(sf);

  // Fill TBD if empty
  const fillTBD = (arr: TieData[], expected: number): TieData[] => {
    const result = [...arr];
    while (result.length < expected) {
      result.push({ team1: "미정", team2: "미정", team1Logo: "", team2Logo: "", leg1: null, leg2: null, aggTeam1: 0, aggTeam2: 0, winner: null, finished: false });
    }
    return result;
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Scroll arrows */}
      <button onClick={() => bracketRef.current?.scrollBy({ left: -250, behavior: "smooth" })} className="cursor-pointer" style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: "32px", height: "32px", borderRadius: "50%", background: "#111827ee", border: "1px solid #1E2D47", color: "#8494A7", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>◀</button>
      <button onClick={() => bracketRef.current?.scrollBy({ left: 250, behavior: "smooth" })} className="cursor-pointer" style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: "32px", height: "32px", borderRadius: "50%", background: "#111827ee", border: "1px solid #1E2D47", color: "#8494A7", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>▶</button>
    <div ref={bracketRef} style={{ overflowX: "auto", padding: "8px 0" }} className="scrollbar-hide">
      <div style={{ display: "flex", alignItems: "stretch", justifyContent: "center", minWidth: "fit-content", gap: "0px" }}>
        {/* ── Left side ── */}
        {r16L.length > 0 && (
          <>
            <BracketCol ties={r16L} label="16강" connector />
            <Connector count={Math.floor(r16L.length / 2)} />
          </>
        )}
        {qfL.length > 0 && (
          <>
            <BracketCol ties={qfL} label="8강" connector />
            <Connector count={Math.floor(qfL.length / 2)} />
          </>
        )}
        {sfL.length > 0 && (
          <BracketCol ties={sfL} label="4강" connector />
        )}
        {sfL.length > 0 && <Connector count={1} />}

        {/* ── Final (center) ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: "0 12px" }}>
          {(() => {
            const info = LEAGUE_LOGOS[leagueId];
            return info ? (
              <>
                <img src={info.logo} alt={info.name} style={{ width: "64px", height: "64px", objectFit: "contain", marginBottom: "6px" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#E1E7EF", marginBottom: "4px" }}>{info.name}</div>
              </>
            ) : null;
          })()}
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#FBBF24", marginBottom: "8px" }}>결승</div>
          {f.length > 0 ? <TieCard tie={f[0]} /> : <TBDCard />}
        </div>

        {/* ── Right side (mirror) ── */}
        {sfR.length > 0 && <Connector count={1} />}
        {sfR.length > 0 && (
          <BracketCol ties={sfR} label="4강" mirror connector />
        )}
        {qfR.length > 0 && (
          <>
            <Connector count={Math.floor(qfR.length / 2)} />
            <BracketCol ties={qfR} label="8강" mirror connector />
          </>
        )}
        {r16R.length > 0 && (
          <>
            <Connector count={Math.floor(r16R.length / 2)} />
            <BracketCol ties={r16R} label="16강" mirror />
          </>
        )}
      </div>
    </div>
    </div>
  );
}
