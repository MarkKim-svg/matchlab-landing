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

// Individual award keywords
const INDIVIDUAL_KW = ["ballon", "golden boot", "golden ball", "golden glove", "golden shoe", "best player", "mvp", "poty", "young player", "top scorer", "top assist", "best goal", "player of", "pichichi", "capocannoniere", "trofeo", "footballer of", "playmaker", "the best"];

// Major team competitions (whitelist approach)
const MAJOR_TEAM_KW = [
  // Domestic leagues
  "premier league", "la liga", "serie a", "bundesliga", "ligue 1", "eredivisie", "primeira liga", "süper lig",
  // Domestic cups
  "fa cup", "copa del rey", "coppa italia", "dfb-pokal", "dfb pokal", "coupe de france", "league cup", "carabao", "efl cup",
  // Super cups
  "community shield", "supercopa", "supercoppa", "dfl-supercup", "trophée des champions",
  // Continental
  "champions league", "europa league", "conference league", "uefa super cup", "club world cup", "intercontinental",
  // National team
  "world cup", "euro 20", "copa america", "nations league", "african cup", "asian cup",
];

const COUNTRY_FLAGS: Record<string, string> = {
  england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", spain: "🇪🇸", italy: "🇮🇹", germany: "🇩🇪", france: "🇫🇷",
  portugal: "🇵🇹", netherlands: "🇳🇱", brazil: "🇧🇷", argentina: "🇦🇷", world: "🌍",
  europe: "🇪🇺", "saudi-arabia": "🇸🇦", turkey: "🇹🇷", usa: "🇺🇸", japan: "🇯🇵",
};

function getFlag(country: string): string {
  return COUNTRY_FLAGS[country.toLowerCase()] ?? "";
}

function TrophySection({ trophies }: { trophies: PlayerData["trophies"] }) {
  const [teamOpen, setTeamOpen] = useState(true);
  const [indivOpen, setIndivOpen] = useState(true);

  const isIndividual = (t: { league: string }) => INDIVIDUAL_KW.some(kw => t.league.toLowerCase().includes(kw));
  const isMajorTeam = (t: { league: string }) => MAJOR_TEAM_KW.some(kw => t.league.toLowerCase().includes(kw));

  // Team: winners only + major competitions only
  const teamTrophies = trophies.filter(t => !isIndividual(t) && t.place === "Winner" && isMajorTeam(t));
  // Individual: winners only
  const indivTrophies = trophies.filter(t => isIndividual(t) && t.place === "Winner");

  function groupTrophies(list: PlayerData["trophies"]) {
    const map = new Map<string, { league: string; country: string; seasons: string[]; count: number }>();
    for (const t of list) {
      // Fix short/ambiguous names
      const displayName = t.league.length <= 4 && t.country ? `${t.country} ${t.league}` : t.league;
      const key = displayName;
      const existing = map.get(key);
      if (existing) {
        if (!existing.seasons.includes(t.season)) existing.seasons.push(t.season);
        existing.count++;
      } else {
        map.set(key, { league: displayName, country: t.country, seasons: [t.season], count: 1 });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }

  function TrophyGroup({ label, icon, items, open, toggle, emptyMsg }: { label: string; icon: string; items: ReturnType<typeof groupTrophies>; open: boolean; toggle: () => void; emptyMsg?: string }) {
    if (items.length === 0) return emptyMsg ? <div style={{ fontSize: "12px", color: "#566378", padding: "4px 0" }}>{emptyMsg}</div> : null;
    const totalCount = items.reduce((s, t) => s + t.count, 0);
    return (
      <div>
        <button onClick={toggle} className="cursor-pointer" style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", padding: "6px 0", width: "100%" }}>
          <span style={{ fontSize: "14px" }}>{icon}</span>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#E1E7EF" }}>{label}</span>
          <span style={{ fontSize: "12px", color: "#10B981", fontWeight: 700 }}>{totalCount}회</span>
          <span style={{ marginLeft: "auto", fontSize: "12px", color: "#566378" }}>{open ? "▼" : "▶"}</span>
        </button>
        {open && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
            {items.map((t, i) => {
              const flag = getFlag(t.country);
              return (
                <div key={i} style={{ background: "#FBBF2408", border: "1px solid #FBBF2420", borderRadius: "8px", padding: "10px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", flexShrink: 0 }}>🏆</span>
                  {flag && <span style={{ fontSize: "14px", flexShrink: 0 }}>{flag}</span>}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#FBBF24" }}>{t.league}</span>
                      {t.count > 1 && <span style={{ fontSize: "13px", fontWeight: 700, color: "#10B981" }}>{t.count}회</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const teamGrouped = groupTrophies(teamTrophies);
  const indivGrouped = groupTrophies(indivTrophies);

  return (
    <div>
      <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#E1E7EF", marginBottom: "10px" }}>🏆 수상 경력</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <TrophyGroup label="팀 수상" icon="🏆" items={teamGrouped} open={teamOpen} toggle={() => setTeamOpen(v => !v)} />
        <TrophyGroup label="개인 수상" icon="🏅" items={indivGrouped} open={indivOpen} toggle={() => setIndivOpen(v => !v)} emptyMsg="개인 수상 기록이 없습니다" />
      </div>
    </div>
  );
}

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
            {/* Trophies — grouped & collapsed */}
            {data.trophies.length > 0 && <TrophySection trophies={data.trophies} />}

            {/* 클럽 경력 */}
            {data.transfers.length > 0 && (
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#E1E7EF", marginBottom: "10px" }}>🏆 클럽 경력</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {(() => {
                    // transfers는 날짜 desc 정렬 → asc로 변환하여 경력 구간 생성
                    const sorted = [...data.transfers].sort((a, b) => a.date.localeCompare(b.date));
                    interface Stint { startYear: number; endYear: number | null; teamName: string; teamLogo: string; teamId: number; isLoan: boolean }
                    const stints: Stint[] = [];
                    for (const t of sorted) {
                      const year = new Date(t.date).getFullYear();
                      // 이전 stint 종료
                      if (stints.length > 0 && stints[stints.length - 1].endYear === null) {
                        stints[stints.length - 1].endYear = year;
                      }
                      stints.push({ startYear: year, endYear: null, teamName: t.teamIn, teamLogo: t.teamInLogo, teamId: t.teamInId, isLoan: t.type === "Loan" });
                    }
                    // 최신 stint는 "현재"
                    return stints.reverse().map((s, i) => (
                      <Link key={i} href={`/team/${s.teamId}`} style={{ textDecoration: "none" }}>
                        <div style={{ background: "#111827", border: "1px solid #1E2D47", borderRadius: "8px", padding: "10px 12px", display: "flex", alignItems: "center", gap: "10px" }} className="hover:border-emerald-500/30 transition-colors">
                          <span style={{ fontSize: "12px", color: "#566378", width: "72px", flexShrink: 0, fontFamily: "'JetBrains Mono',monospace" }}>
                            {s.startYear}~{s.endYear === null ? "현재" : s.endYear}
                          </span>
                          {s.teamLogo && <img src={s.teamLogo} alt="" style={{ width: "22px", height: "22px", objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 0 1px rgba(255,255,255,0.25))" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#E1E7EF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{s.teamName}</span>
                          {s.isLoan && <span style={{ fontSize: "9px", color: "#FBBF24", background: "#FBBF2415", borderRadius: "4px", padding: "2px 6px", flexShrink: 0 }}>임대</span>}
                        </div>
                      </Link>
                    ));
                  })()}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
