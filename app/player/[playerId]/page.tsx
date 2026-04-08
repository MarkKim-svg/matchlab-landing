"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AuthTabBar from "@/components/AuthTabBar";

interface PlayerData {
  player: { id: number; name: string; firstname: string; lastname: string; photo: string; nationality: string; age: number; height: string; weight: string };
  position: string;
  teamName: string; teamLogo: string; teamId: number; number: number;
  totals: { appearances: number; goals: number; assists: number; minutes: number; yellow: number; red: number; shots: number; shotsOn: number; passes: number; passKey: number; tackles: number; interceptions: number; dribbles: number; dribblesSuccess: number; saves: number };
  perCompetition: { league: string; leagueLogo: string; teamName: string; teamLogo: string; teamId: number; appearances: number; starts: number; minutes: number; goals: number; assists: number }[];
  trophies: { league: string; country: string; season: string; place: string }[];
  transfers: { date: string; type: string; teamIn: string; teamInLogo: string; teamInId: number; teamOut: string; teamOutLogo: string; teamOutId: number }[];
}

const POS_LABELS: Record<string, string> = { Goalkeeper: "골키퍼", Defender: "수비수", Midfielder: "미드필더", Attacker: "공격수" };

export default function PlayerPage() {
  const params = useParams<{ playerId: string }>();
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/player/${params.playerId}`)
      .then(r => r.json())
      .then(d => d.error ? setData(null) : setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [params.playerId]);

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A" }}>
      <Navbar />
      <AuthTabBar />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-8 space-y-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div style={{ height: "150px", borderRadius: "14px", background: "#1A2332" }} />
            <div style={{ height: "200px", borderRadius: "14px", background: "#1A2332" }} />
          </div>
        ) : !data ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#566378" }}>선수 정보를 찾을 수 없습니다</div>
        ) : (
          <>
            {/* Header */}
            <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "14px", padding: "24px", display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
              <img src={data.player.photo} alt={data.player.name} style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", background: "#0F172A", border: "3px solid #334155" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <div style={{ flex: 1, minWidth: "200px" }}>
                <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#E1E7EF" }}>{data.player.name}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
                  {data.number > 0 && <span style={{ fontSize: "14px", fontWeight: 700, color: "#10B981", fontFamily: "'JetBrains Mono',monospace" }}>#{data.number}</span>}
                  <span style={{ fontSize: "13px", color: "#8494A7" }}>{POS_LABELS[data.position] ?? data.position}</span>
                  <span style={{ fontSize: "13px", color: "#566378" }}>·</span>
                  <span style={{ fontSize: "13px", color: "#8494A7" }}>{data.player.nationality}</span>
                  {data.player.age && <span style={{ fontSize: "13px", color: "#566378" }}>{data.player.age}세</span>}
                </div>
                <Link href={`/team/${data.teamId}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "8px", textDecoration: "none" }}>
                  <img src={data.teamLogo} alt="" style={{ width: "20px", height: "20px", objectFit: "contain", filter: "drop-shadow(0 0 1px rgba(255,255,255,0.25))" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <span style={{ fontSize: "13px", color: "#E1E7EF" }} className="hover:text-emerald-400 transition-colors">{data.teamName}</span>
                </Link>
                {(data.player.height || data.player.weight) && (
                  <div style={{ fontSize: "12px", color: "#566378", marginTop: "4px" }}>
                    {data.player.height && <span>{data.player.height}</span>}
                    {data.player.height && data.player.weight && <span> · </span>}
                    {data.player.weight && <span>{data.player.weight}</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Season Stats */}
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#E1E7EF", marginBottom: "10px" }}>📊 2025-26 시즌 스탯</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: "8px" }}>
                {[
                  { label: "출전", value: data.totals.appearances },
                  { label: "득점", value: data.totals.goals, highlight: true },
                  { label: "도움", value: data.totals.assists, highlight: true },
                  { label: "출전(분)", value: data.totals.minutes },
                  { label: "슈팅", value: data.totals.shots },
                  { label: "유효슈팅", value: data.totals.shotsOn },
                  { label: "키패스", value: data.totals.passKey },
                  { label: "태클", value: data.totals.tackles },
                  { label: "인터셉트", value: data.totals.interceptions },
                  { label: "경고", value: data.totals.yellow },
                  { label: "퇴장", value: data.totals.red },
                  ...(data.totals.saves > 0 ? [{ label: "세이브", value: data.totals.saves }] : []),
                ].map(s => (
                  <div key={s.label} style={{ background: "#111827", border: "1px solid #1E2D47", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: (s as any).highlight ? "#10B981" : "#E1E7EF", fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</div>
                    <div style={{ fontSize: "9px", color: "#566378" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Per Competition */}
            {data.perCompetition.length > 0 && (
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#E1E7EF", marginBottom: "10px" }}>🏆 대회별 기록</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {data.perCompetition.map((c, i) => (
                    <div key={i} style={{ background: "#111827", border: "1px solid #1E2D47", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                      {c.leagueLogo && <img src={c.leagueLogo} alt="" style={{ width: "18px", height: "18px", objectFit: "contain", flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                      <span style={{ fontSize: "12px", color: "#E1E7EF", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.league}</span>
                      <span style={{ fontSize: "11px", color: "#566378", flexShrink: 0 }}>{c.appearances}경기</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#E1E7EF", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>{c.goals}G</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#8494A7", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>{c.assists}A</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Trophies */}
            {data.trophies.length > 0 && (
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#E1E7EF", marginBottom: "10px" }}>🏆 수상 경력</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {data.trophies.map((t, i) => {
                    const isWinner = t.place === "Winner";
                    const isRunner = t.place === "2nd Place" || t.place?.includes("Runner");
                    return (
                      <div key={i} style={{ background: isWinner ? "#FBBF2408" : "#111827", border: isWinner ? "1px solid #FBBF2425" : "1px solid #1E2D47", borderRadius: "8px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "14px", flexShrink: 0 }}>{isWinner ? "🏆" : isRunner ? "🥈" : "🏅"}</span>
                        <span style={{ fontSize: "12px", color: isWinner ? "#FBBF24" : "#E1E7EF", fontWeight: isWinner ? 700 : 500, flex: 1 }}>{t.league}</span>
                        <span style={{ fontSize: "11px", color: "#566378", flexShrink: 0 }}>{t.season}</span>
                        <span style={{ fontSize: "10px", color: "#8494A7", flexShrink: 0 }}>{t.country}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Transfers */}
            {data.transfers.length > 0 && (
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#E1E7EF", marginBottom: "10px" }}>🔄 이적 히스토리</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {data.transfers.map((t, i) => (
                    <div key={i} style={{ background: "#111827", border: "1px solid #1E2D47", borderRadius: "8px", padding: "10px 12px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "10px", color: "#566378", width: "60px", flexShrink: 0 }}>{t.date.slice(0, 7)}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, minWidth: 0 }}>
                        {t.teamOutLogo && <img src={t.teamOutLogo} alt="" style={{ width: "18px", height: "18px", objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 0 1px rgba(255,255,255,0.25))" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                        <span style={{ fontSize: "11px", color: "#8494A7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.teamOut}</span>
                        <span style={{ fontSize: "12px", color: "#10B981", flexShrink: 0 }}>→</span>
                        {t.teamInLogo && <img src={t.teamInLogo} alt="" style={{ width: "18px", height: "18px", objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 0 1px rgba(255,255,255,0.25))" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                        <span style={{ fontSize: "11px", color: "#E1E7EF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.teamIn}</span>
                      </div>
                      <span style={{ fontSize: "9px", color: "#475569", background: "#0F172A", borderRadius: "4px", padding: "2px 6px", flexShrink: 0 }}>{t.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
