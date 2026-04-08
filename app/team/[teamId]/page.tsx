"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AuthTabBar from "@/components/AuthTabBar";
import { Suspense } from "react";

interface RecentMatch { fixtureId: number; date: string; homeTeam: string; awayTeam: string; homeTeamId: string; awayTeamId: string; homeGoals: number | null; awayGoals: number | null; league: string; status: string; }
interface NextMatch { fixtureId: number; date: string; kickoffUTC: string; homeTeam: string; awayTeam: string; homeTeamId: string; awayTeamId: string; league: string; }
interface SquadPlayer { id: number; name: string; number: number; position: string; photo: string; age: number; }
interface TopPlayer { id: number; name: string; photo: string; goals: number; assists: number; appearances: number; }
interface SeasonStats { played: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number; cleanSheets: number; form: string; }

const POS_ORDER = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];
const POS_LABELS: Record<string, string> = { Goalkeeper: "GK", Defender: "DF", Midfielder: "MF", Attacker: "FW" };

function FormBadge({ ch }: { ch: string }) {
  const bg = ch === "W" ? "#10B981" : ch === "L" ? "#EF4444" : "#475569";
  return <span style={{ width: "20px", height: "20px", borderRadius: "4px", background: bg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "#fff" }}>{ch === "W" ? "승" : ch === "L" ? "패" : "무"}</span>;
}

function TeamDetailContent() {
  const params = useParams<{ teamId: string }>();
  const searchParams = useSearchParams();
  const teamId = params.teamId;
  const leagueId = searchParams.get("league") || "";

  const [data, setData] = useState<{ recent: RecentMatch[]; next: NextMatch[]; squad: SquadPlayer[]; topPlayers: TopPlayer[]; seasonStats: SeasonStats | null; allCompStats?: { played: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number; cleanSheets: number } | null; competitions?: { name: string; logo: string }[] } | null>(null);
  const [loading, setLoading] = useState(true);

  // Get team info from first fixture
  const teamName = data?.recent?.[0]?.homeTeamId === teamId ? data.recent[0].homeTeam : data?.recent?.[0]?.awayTeam ?? "팀";

  useEffect(() => {
    setLoading(true);
    fetch(`/api/team/${teamId}?league=${leagueId}&season=2025`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [teamId, leagueId]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-8">
      <div className="animate-pulse space-y-4">
        <div style={{ height: "100px", borderRadius: "14px", background: "#1A2332" }} />
        <div style={{ height: "200px", borderRadius: "14px", background: "#1A2332" }} />
      </div>
    </div>
  );

  if (!data) return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 text-center" style={{ color: "#566378" }}>
      팀 데이터를 불러올 수 없습니다
    </div>
  );

  const ss = data.seasonStats;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-8 space-y-6">
      {/* Header + All-comp stats */}
      <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "14px", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
          <img src={`https://media.api-sports.io/football/teams/${teamId}.png`} alt="" style={{ width: "64px", height: "64px", objectFit: "contain", filter: "drop-shadow(0 0 1px rgba(255,255,255,0.25))" }} />
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#E1E7EF" }}>{teamName}</h1>
            {ss?.form && (
              <div style={{ display: "flex", gap: "3px", marginTop: "8px" }}>
                {ss.form.split("").slice(-5).map((ch, i) => <FormBadge key={i} ch={ch} />)}
              </div>
            )}
            {/* Competitions */}
            {data.competitions && data.competitions.length > 0 && (
              <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
                {data.competitions.map((c, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#0F172A", border: "1px solid #1E2D47", borderRadius: "8px", padding: "3px 8px", fontSize: "11px", color: "#8494A7" }}>
                    {c.logo && <img src={c.logo} alt="" style={{ width: "14px", height: "14px", objectFit: "contain" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                    {c.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All-comp season stats */}
        {data.allCompStats && (() => {
          const ac = data.allCompStats;
          return (
            <>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#8494A7", marginBottom: "8px" }}>2025-26 시즌 전체 대회</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))", gap: "6px" }}>
                {[
                  { label: "경기", value: ac.played }, { label: "승", value: ac.wins }, { label: "무", value: ac.draws }, { label: "패", value: ac.losses },
                  { label: "득점", value: ac.goalsFor }, { label: "실점", value: ac.goalsAgainst }, { label: "득실", value: ac.goalsFor - ac.goalsAgainst }, { label: "클린시트", value: ac.cleanSheets },
                ].map(s => (
                  <div key={s.label} style={{ background: "#0F172A", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#E1E7EF", fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</div>
                    <div style={{ fontSize: "9px", color: "#566378" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </>
          );
        })()}
      </div>

      {/* League Stats */}
      {ss && leagueId && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <img src={`https://media.api-sports.io/football/leagues/${leagueId}.png`} alt="" style={{ width: "20px", height: "20px", objectFit: "contain" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#10B981" }}>리그 2025-26 기준</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: "8px" }}>
            {[
              { label: "경기", value: ss.played },
              { label: "승", value: ss.wins },
              { label: "무", value: ss.draws },
              { label: "패", value: ss.losses },
              { label: "득점", value: ss.goalsFor },
              { label: "실점", value: ss.goalsAgainst },
              { label: "득실", value: ss.goalsFor - ss.goalsAgainst },
              { label: "클린시트", value: ss.cleanSheets },
            ].map(s => (
              <div key={s.label} style={{ background: "#111827", border: "1px solid #1E2D47", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#E1E7EF", fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</div>
                <div style={{ fontSize: "10px", color: "#566378" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Matches */}
      {data.recent.length > 0 && (
        <div>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#E1E7EF", marginBottom: "10px" }}>📋 최근 경기</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {data.recent.map((m, i) => {
              const isHome = m.homeTeamId === teamId;
              const opponent = isHome ? m.awayTeam : m.homeTeam;
              const opponentId = isHome ? m.awayTeamId : m.homeTeamId;
              const fin = m.status === "FT" || m.status === "AET" || m.status === "PEN";
              const myGoals = isHome ? m.homeGoals : m.awayGoals;
              const theirGoals = isHome ? m.awayGoals : m.homeGoals;
              const result = fin && myGoals !== null && theirGoals !== null ? (myGoals > theirGoals ? "W" : myGoals < theirGoals ? "L" : "D") : null;

              return (
                <div key={i} style={{ background: "#111827", border: "1px solid #1E2D47", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "10px", color: "#566378", width: "55px", flexShrink: 0 }}>{m.date.slice(5)}</span>
                  <span style={{ fontSize: "10px", color: isHome ? "#10B981" : "#8494A7", width: "14px", flexShrink: 0 }}>{isHome ? "H" : "A"}</span>
                  <Link href={`/team/${opponentId}`} onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, minWidth: 0, textDecoration: "none" }}>
                    <img src={`https://media.api-sports.io/football/teams/${opponentId}.png`} alt="" style={{ width: "20px", height: "20px", objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 0 1px rgba(255,255,255,0.25))" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <span style={{ fontSize: "12px", color: "#E1E7EF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="hover:text-emerald-400 transition-colors">{opponent}</span>
                  </Link>
                  <span style={{ fontSize: "9px", color: "#475569", flexShrink: 0 }}>{m.league}</span>
                  {fin && m.homeGoals !== null && (
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#E1E7EF", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>{m.homeGoals}-{m.awayGoals}</span>
                  )}
                  {result && <FormBadge ch={result} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Next Matches */}
      {data.next.length > 0 && (
        <div>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#E1E7EF", marginBottom: "10px" }}>📅 다음 경기</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {data.next.map((m, i) => {
              const isHome = m.homeTeamId === teamId;
              const opponent = isHome ? m.awayTeam : m.homeTeam;
              const opponentId = isHome ? m.awayTeamId : m.homeTeamId;
              return (
                <div key={i} style={{ background: "#111827", border: "1px solid #1E2D47", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "10px", color: "#566378", width: "55px", flexShrink: 0 }}>{m.date.slice(5)}</span>
                  <span style={{ fontSize: "10px", color: isHome ? "#10B981" : "#8494A7", width: "14px", flexShrink: 0 }}>{isHome ? "H" : "A"}</span>
                  <Link href={`/team/${opponentId}`} style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, minWidth: 0, textDecoration: "none" }}>
                    <img src={`https://media.api-sports.io/football/teams/${opponentId}.png`} alt="" style={{ width: "20px", height: "20px", objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 0 1px rgba(255,255,255,0.25))" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <span style={{ fontSize: "12px", color: "#E1E7EF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="hover:text-emerald-400 transition-colors">{opponent}</span>
                  </Link>
                  <span style={{ fontSize: "10px", color: "#566378", flexShrink: 0 }}>{m.league}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Players */}
      {data.topPlayers.length > 0 && (
        <div>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#E1E7EF", marginBottom: "10px" }}>⭐ 탑 플레이어</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {data.topPlayers.map((p, i) => (
              <Link key={p.name} href={`/player/${p.id}`} style={{ textDecoration: "none" }}>
              <div style={{ background: i === 0 ? "#FBBF2410" : "#111827", border: i === 0 ? "1px solid #FBBF2430" : "1px solid #1E2D47", borderRadius: "10px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px" }} className="hover:border-emerald-500/30 transition-colors">
                {p.photo ? <img src={p.photo} alt="" style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#1E293B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#8494A7", flexShrink: 0 }}>{p.name.charAt(0)}</div>}
                <span style={{ fontSize: "12px", fontWeight: 600, color: i === 0 ? "#FBBF24" : "#E1E7EF", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#E1E7EF", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>{p.goals}G</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#8494A7", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>{p.assists}A</span>
              </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Squad */}
      {data.squad.length > 0 && (
        <div>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#E1E7EF", marginBottom: "10px" }}>👥 스쿼드</h2>
          {POS_ORDER.map(pos => {
            const players = data.squad.filter(p => p.position === pos);
            if (players.length === 0) return null;
            return (
              <div key={pos} style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#10B981", marginBottom: "6px" }}>{POS_LABELS[pos] || pos}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "6px" }}>
                  {players.map(p => (
                    <Link key={p.id} href={`/player/${p.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ background: "#111827", border: "1px solid #1E2D47", borderRadius: "8px", padding: "8px 10px", display: "flex", alignItems: "center", gap: "6px" }} className="hover:border-emerald-500/30 transition-colors">
                        {p.photo ? <img src={p.photo} alt="" style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#1E293B", flexShrink: 0 }} />}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "11px", fontWeight: 600, color: "#E1E7EF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.number ? `#${p.number} ` : ""}{p.name}</div>
                          <div style={{ fontSize: "9px", color: "#566378" }}>{p.age}세</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0F172A" }}>
      <Navbar />
      <AuthTabBar />
      <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-6 text-center" style={{ color: "#566378" }}>로딩 중...</div>}>
        <TeamDetailContent />
      </Suspense>
    </div>
  );
}
