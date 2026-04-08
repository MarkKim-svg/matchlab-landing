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

export default function TeamsPage() {
  const [leagueId, setLeagueId] = useState("39");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/standings?league=${leagueId}`)
      .then(r => r.json())
      .then(d => setTeams((d.standings ?? []).map((t: any) => ({ teamId: t.teamId, teamName: t.teamName, teamLogo: t.teamLogo, rank: t.rank, points: t.points }))))
      .catch(() => setTeams([]))
      .finally(() => setLoading(false));
  }, [leagueId]);

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A" }}>
      <Navbar />
      <AuthTabBar />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-8">
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#E1E7EF", marginBottom: "16px" }}>⚽ 팀</h1>

        <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "20px" }} className="scrollbar-hide">
          {LEAGUES.map(l => (
            <button key={l.id} onClick={() => setLeagueId(l.id)} className="cursor-pointer" style={{ flexShrink: 0, padding: "6px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, background: l.id === leagueId ? "rgba(16,185,129,0.15)" : "#1E293B", color: l.id === leagueId ? "#34D399" : "#8494A7", border: l.id === leagueId ? "1px solid rgba(16,185,129,0.4)" : "1px solid #334155" }}>
              {l.name}
            </button>
          ))}
        </div>

        {loading ? (
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
        )}
      </main>
    </div>
  );
}
