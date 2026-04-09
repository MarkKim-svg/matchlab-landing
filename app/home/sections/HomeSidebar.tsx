"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

const LEAGUES = [
  { id: "39", name: "EPL" },
  { id: "140", name: "라리가" },
  { id: "135", name: "세리에A" },
  { id: "78", name: "분데스" },
  { id: "61", name: "리그1" },
  { id: "2", name: "UCL" },
  { id: "3", name: "UEL" },
  { id: "848", name: "UECL" },
];

interface Standing {
  rank: number;
  teamName: string;
  teamLogo: string;
  points: number;
  played: number;
  win: number;
  draw: number;
  lose: number;
}

interface Scorer {
  rank: number;
  playerName: string;
  teamName: string;
  goals: number;
  assists: number;
}

export default function HomeSidebar() {
  const [leagueId, setLeagueId] = useState("39");
  const [standings, setStandings] = useState<Standing[]>([]);
  const [scorers, setScorers] = useState<Scorer[]>([]);
  const [standingsLoading, setStandingsLoading] = useState(true);
  const [scorersLoading, setScorersLoading] = useState(true);

  const selectedName = LEAGUES.find((l) => l.id === leagueId)?.name ?? "EPL";

  useEffect(() => {
    setStandingsLoading(true);
    fetch(`/api/standings?league=${leagueId}`)
      .then((r) => r.json())
      .then((d) => setStandings((d.standings ?? []).slice(0, 10)))
      .catch(() => setStandings([]))
      .finally(() => setStandingsLoading(false));
  }, [leagueId]);

  useEffect(() => {
    setScorersLoading(true);
    fetch(`/api/top-scorers?league=${leagueId}`)
      .then((r) => r.json())
      .then((d) => setScorers((d.scorers ?? []).slice(0, 5)))
      .catch(() => setScorers([]))
      .finally(() => setScorersLoading(false));
  }, [leagueId]);

  const topGoals = [...scorers].sort((a, b) => b.goals - a.goals).slice(0, 5);
  const topAssists = [...scorers].sort((a, b) => b.assists - a.assists).slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* League tabs with arrows */}
      <TabScroller>
        {LEAGUES.map((l) => (
          <button
            key={l.id}
            onClick={() => setLeagueId(l.id)}
            className="cursor-pointer"
            style={{
              flexShrink: 0, padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 500,
              background: l.id === leagueId ? "rgba(16,185,129,0.15)" : "transparent",
              color: l.id === leagueId ? "#34D399" : "#566378",
              border: "none",
            }}
          >
            {l.name}
          </button>
        ))}
      </TabScroller>

      {/* Mini Standings */}
      <SidebarCard>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#E1E7EF" }}>🏆 {selectedName} 순위</span>
          <Link href="/standings" style={{ fontSize: "11px", fontWeight: 600, color: "#10B981" }}>전체 →</Link>
        </div>
        {standingsLoading ? <SkeletonRows count={6} /> : standings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "12px 0", fontSize: "12px", color: "#566378" }}>시즌 준비 중</div>
        ) : (
          <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "#566378", fontSize: "10px" }}>
                <th style={{ textAlign: "left", padding: "2px 4px", width: "24px" }}>#</th>
                <th style={{ textAlign: "left", padding: "2px 4px" }}>팀</th>
                <th style={{ textAlign: "center", padding: "2px 4px", width: "24px" }}>경</th>
                <th style={{ textAlign: "center", padding: "2px 4px", width: "20px" }}>승</th>
                <th style={{ textAlign: "center", padding: "2px 4px", width: "20px" }}>무</th>
                <th style={{ textAlign: "center", padding: "2px 4px", width: "20px" }}>패</th>
                <th style={{ textAlign: "center", padding: "2px 4px", width: "28px" }}>승점</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((t) => (
                <tr key={t.rank}>
                  <td style={{ padding: "4px", color: "#566378", fontFamily: "'JetBrains Mono',monospace" }}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      <span style={{ width: "2px", height: "14px", borderRadius: "2px", marginRight: "4px", background: t.rank <= 4 ? "#10B981" : "transparent" }} />
                      {t.rank}
                    </span>
                  </td>
                  <td style={{ padding: "4px", maxWidth: 0 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <img src={t.teamLogo} alt="" style={{ width: "14px", height: "14px", objectFit: "contain", flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      <span style={{ fontWeight: 600, color: "#E1E7EF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.teamName}</span>
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: "4px", color: "#8494A7" }}>{t.played}</td>
                  <td style={{ textAlign: "center", padding: "4px", color: "#8494A7" }}>{t.win}</td>
                  <td style={{ textAlign: "center", padding: "4px", color: "#8494A7" }}>{t.draw}</td>
                  <td style={{ textAlign: "center", padding: "4px", color: "#8494A7" }}>{t.lose}</td>
                  <td style={{ textAlign: "center", padding: "4px", fontWeight: 700, color: "#10B981", fontFamily: "'JetBrains Mono',monospace" }}>{t.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SidebarCard>

      {/* Top Scorers */}
      <SidebarCard>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#E1E7EF" }}>⚽ 득점 TOP 5</span>
          <Link href="/standings?tab=scorers" style={{ fontSize: "11px", fontWeight: 600, color: "#10B981" }}>전체 →</Link>
        </div>
        {scorersLoading ? <SkeletonRows count={5} /> : topGoals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "12px 0", fontSize: "12px", color: "#566378" }}>시즌 준비 중</div>
        ) : (
          <PlayerList players={topGoals} valueKey="goals" />
        )}
      </SidebarCard>

      {/* Top Assists */}
      <SidebarCard>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#E1E7EF" }}>🅰️ 도움 TOP 5</span>
          <Link href="/standings?tab=assists" style={{ fontSize: "11px", fontWeight: 600, color: "#10B981" }}>전체 →</Link>
        </div>
        {scorersLoading ? <SkeletonRows count={5} /> : topAssists.length === 0 ? (
          <div style={{ textAlign: "center", padding: "12px 0", fontSize: "12px", color: "#566378" }}>시즌 준비 중</div>
        ) : (
          <PlayerList players={topAssists} valueKey="assists" />
        )}
      </SidebarCard>
    </div>
  );
}

function SidebarCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#111827", border: "1px solid #1E2D47", borderRadius: "14px", padding: "14px" }}>
      {children}
    </div>
  );
}

function PlayerList({ players, valueKey }: { players: Scorer[]; valueKey: "goals" | "assists" }) {
  return (
    <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
      <tbody>
        {players.map((p, i) => (
          <tr key={p.playerName}>
            <td style={{ padding: "3px 4px", width: "20px", color: "#566378", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>
              {i + 1}
            </td>
            <td style={{ padding: "3px 4px" }}>
              <div style={{ fontWeight: 600, color: "#E1E7EF", lineHeight: 1.3 }}>{p.playerName}</div>
              <div style={{ fontSize: "10px", color: "#566378" }}>{p.teamName}</div>
            </td>
            <td style={{ textAlign: "right", padding: "3px 4px", fontWeight: 700, fontSize: "14px", color: "#E1E7EF", fontFamily: "'JetBrains Mono',monospace" }}>
              {p[valueKey]}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <div className="animate-pulse" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ height: "20px", borderRadius: "4px", background: "#1A2332" }} />
      ))}
    </div>
  );
}

function TabScroller({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 100, behavior: "smooth" });
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <button onClick={() => scroll(-1)} className="cursor-pointer" style={{ flexShrink: 0, width: "22px", height: "22px", borderRadius: "50%", background: "#111827", border: "1px solid #1E2D47", color: "#8494A7", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>◀</button>
      <div ref={scrollRef} className="scrollbar-hide" style={{ display: "flex", gap: "4px", overflowX: "auto", flex: 1 }}>
        {children}
      </div>
      <button onClick={() => scroll(1)} className="cursor-pointer" style={{ flexShrink: 0, width: "22px", height: "22px", borderRadius: "50%", background: "#111827", border: "1px solid #1E2D47", color: "#8494A7", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>▶</button>
    </div>
  );
}
