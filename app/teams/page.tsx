"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AuthTabBar from "@/components/AuthTabBar";

const LEAGUES = [
  { id: "39", name: "EPL" },
  { id: "140", name: "라리가" },
  { id: "135", name: "세리에A" },
  { id: "78", name: "분데스" },
  { id: "61", name: "리그1" },
];

interface Team { teamId: number; teamName: string; teamLogo: string; rank: number; points: number; }
interface Scorer { rank: number; playerName: string; playerPhoto: string; teamName: string; teamLogo: string; goals: number; assists: number; appearances: number; playerId?: number; }

const MEDAL: Record<number, string> = { 1: "#FBBF24", 2: "#94A3B8", 3: "#D97706" };

export default function TeamsPage() {
  const [tab, setTab] = useState<"teams" | "players">("teams");
  const [leagueId, setLeagueId] = useState("39");
  const [teams, setTeams] = useState<Team[]>([]);
  const [scorers, setScorers] = useState<Scorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerTab, setPlayerTab] = useState<"goals" | "assists" | "points">("goals");

  useEffect(() => {
    setLoading(true);
    if (tab === "teams") {
      fetch(`/api/standings?league=${leagueId}`)
        .then(r => r.json())
        .then(d => setTeams((d.standings ?? []).map((t: any) => ({ teamId: t.teamId, teamName: t.teamName, teamLogo: t.teamLogo, rank: t.rank, points: t.points }))))
        .catch(() => setTeams([]))
        .finally(() => setLoading(false));
    } else {
      fetch(`/api/top-scorers?league=${leagueId}`)
        .then(r => r.json())
        .then(d => setScorers(d.scorers ?? []))
        .catch(() => setScorers([]))
        .finally(() => setLoading(false));
    }
  }, [leagueId, tab]);

  const sortedScorers = [...scorers].sort((a, b) => {
    if (playerTab === "goals") return b.goals - a.goals;
    if (playerTab === "assists") return b.assists - a.assists;
    return (b.goals + b.assists) - (a.goals + a.assists);
  }).map((s, i) => ({ ...s, rank: i + 1 }));

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A" }}>
      <Navbar />
      <AuthTabBar />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-8">
        {/* Top tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {[
            { key: "teams" as const, label: "⚽ 팀" },
            { key: "players" as const, label: "👤 선수" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className="cursor-pointer" style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, border: "none", background: tab === t.key ? "#10B981" : "#1E293B", color: tab === t.key ? "white" : "#8494A7" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* League tabs */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "20px" }} className="scrollbar-hide">
          {LEAGUES.map(l => (
            <button key={l.id} onClick={() => setLeagueId(l.id)} className="cursor-pointer" style={{ flexShrink: 0, padding: "6px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, background: l.id === leagueId ? "rgba(16,185,129,0.15)" : "#1E293B", color: l.id === leagueId ? "#34D399" : "#8494A7", border: l.id === leagueId ? "1px solid rgba(16,185,129,0.4)" : "1px solid #334155" }}>
              {l.name}
            </button>
          ))}
        </div>

        {/* Teams tab */}
        {tab === "teams" && (
          loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px" }}>
              {Array.from({ length: 12 }, (_, i) => <div key={i} className="animate-pulse" style={{ height: "120px", borderRadius: "14px", background: "#1A2332" }} />)}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px" }}>
              {teams.map(t => (
                <Link key={t.teamId} href={`/team/${t.teamId}?league=${leagueId}`}>
                  <div style={{ background: "#111827", border: "1px solid #1E2D47", borderRadius: "14px", padding: "16px 12px", textAlign: "center" }} className="hover:border-emerald-500/30 transition-colors">
                    <img src={t.teamLogo} alt={t.teamName} style={{ width: "48px", height: "48px", objectFit: "contain", margin: "0 auto 8px", filter: "drop-shadow(0 0 1px rgba(255,255,255,0.25))" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#E1E7EF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.teamName}</div>
                    <div style={{ fontSize: "10px", color: "#566378", marginTop: "2px" }}>{t.rank}위 · {t.points}pts</div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* Players tab */}
        {tab === "players" && (
          <>
            {/* Sub tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              {([
                { key: "goals" as const, label: "득점" },
                { key: "assists" as const, label: "도움" },
                { key: "points" as const, label: "공격P" },
              ]).map(t => (
                <button key={t.key} onClick={() => setPlayerTab(t.key)} className="cursor-pointer" style={{ padding: "5px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, border: "none", background: playerTab === t.key ? "#10B981" : "#1E293B", color: playerTab === t.key ? "white" : "#8494A7" }}>
                  {t.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="animate-pulse space-y-3">{Array.from({ length: 8 }, (_, i) => <div key={i} style={{ height: "48px", borderRadius: "10px", background: "#1A2332" }} />)}</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {sortedScorers.map((s) => {
                  const medalColor = MEDAL[s.rank];
                  const value = playerTab === "goals" ? s.goals : playerTab === "assists" ? s.assists : s.goals + s.assists;
                  return (
                    <Link key={`${s.playerName}-${s.rank}`} href={`/player/${s.rank}`} style={{ textDecoration: "none" }}>
                      <div style={{ background: medalColor ? `${medalColor}10` : "#111827", border: medalColor ? `1px solid ${medalColor}30` : "1px solid #1E2D47", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }} className="hover:border-emerald-500/30 transition-colors">
                        <span style={{ fontSize: "12px", fontWeight: 700, color: medalColor ?? "#566378", fontFamily: "'JetBrains Mono',monospace", width: "24px", textAlign: "center", flexShrink: 0 }}>{s.rank}</span>
                        {s.playerPhoto ? <img src={s.playerPhoto} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, background: "#1E293B" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#1E293B", flexShrink: 0 }} />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: medalColor ?? "#E1E7EF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.playerName}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            {s.teamLogo && <img src={s.teamLogo} alt="" style={{ width: "14px", height: "14px", objectFit: "contain", flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                            <span style={{ fontSize: "10px", color: "#566378" }}>{s.teamName}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: "16px", fontWeight: 700, color: "#E1E7EF", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>{value}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
