"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import AuthTabBar from "@/components/AuthTabBar";

const LEAGUES = [
  { id: "39", name: "프리미어리그", logo: "https://media.api-sports.io/football/leagues/39.png" },
  { id: "140", name: "라리가", logo: "https://media.api-sports.io/football/leagues/140.png" },
  { id: "135", name: "세리에A", logo: "https://media.api-sports.io/football/leagues/135.png" },
  { id: "78", name: "분데스리가", logo: "https://media.api-sports.io/football/leagues/78.png" },
  { id: "61", name: "리그1", logo: "https://media.api-sports.io/football/leagues/61.png" },
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
  goalsDiff: number;
  description: string | null;
}

interface Scorer {
  rank: number;
  playerName: string;
  playerPhoto: string;
  teamName: string;
  teamLogo: string;
  goals: number;
  assists: number;
  appearances: number;
}

// ── Zone colors based on description ──
function getZoneColor(desc: string | null, rank: number, total: number): string | null {
  if (desc) {
    const d = desc.toLowerCase();
    if (d.includes("champions league")) return "#10B981";
    if (d.includes("europa league")) return "#F59E0B";
    if (d.includes("conference league")) return "#3B82F6";
    if (d.includes("relegation")) return "#EF4444";
  }
  // Fallback
  if (rank <= 4) return "#10B981";
  if (rank > total - 3) return "#EF4444";
  return null;
}

const SEASONS = [
  { value: "2025", label: "2025-26" },
  { value: "2024", label: "2024-25" },
  { value: "2023", label: "2023-24" },
  { value: "2022", label: "2022-23" },
  { value: "2021", label: "2021-22" },
];

export default function StandingsPage() {
  const [leagueId, setLeagueId] = useState("39");
  const [season, setSeason] = useState("2025");

  const [standings, setStandings] = useState<Standing[]>([]);
  const [scorers, setScorers] = useState<Scorer[]>([]);
  const [standingsLoading, setStandingsLoading] = useState(true);
  const [scorersLoading, setScorersLoading] = useState(true);

  const [playerTab, setPlayerTab] = useState<"goals" | "assists" | "points">("goals");
  const [showAll, setShowAll] = useState(false);

  // Fetch standings
  useEffect(() => {
    setStandingsLoading(true);
    fetch(`/api/standings?league=${leagueId}&season=${season}`)
      .then((r) => r.json())
      .then((d) => setStandings(d.standings ?? []))
      .catch(() => setStandings([]))
      .finally(() => setStandingsLoading(false));
  }, [leagueId, season]);

  // Fetch scorers
  useEffect(() => {
    setScorersLoading(true);
    setShowAll(false);
    fetch(`/api/top-scorers?league=${leagueId}&season=${season}`)
      .then((r) => r.json())
      .then((d) => setScorers(d.scorers ?? []))
      .catch(() => setScorers([]))
      .finally(() => setScorersLoading(false));
  }, [leagueId, season]);

  // Sort scorers by selected tab
  const sortedScorers = useMemo(() => {
    const copy = [...scorers];
    if (playerTab === "goals") copy.sort((a, b) => b.goals - a.goals);
    else if (playerTab === "assists") copy.sort((a, b) => b.assists - a.assists);
    else copy.sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists));
    return copy.map((s, i) => ({ ...s, rank: i + 1 }));
  }, [scorers, playerTab]);

  const displayScorers = showAll ? sortedScorers : sortedScorers.slice(0, 10);
  const top4 = sortedScorers.slice(0, 4);

  return (
    <div className="min-h-screen" style={{ background: "#0F172A" }}>
      <Navbar />
      <AuthTabBar />
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
        {/* ── League selector + Season dropdown ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 flex-1">
            {LEAGUES.map((league) => {
              const active = league.id === leagueId;
              return (
                <button
                  key={league.id}
                  onClick={() => setLeagueId(league.id)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400"
                      : "bg-bg-card border border-bg-border text-text-secondary hover:bg-bg-700 hover:text-text-primary"
                  }`}
                >
                  <img
                    src={league.logo}
                    alt={league.name}
                    className="w-5 h-5 rounded-full bg-white p-0.5 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <span>{league.name}</span>
                </button>
              );
            })}
          </div>

          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="shrink-0 bg-bg-card border border-bg-border rounded-lg px-3 py-1.5 text-sm text-bg-100 font-medium cursor-pointer focus:outline-none focus:border-emerald-500/40"
          >
            {SEASONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* ── Section 1: Team Standings ── */}
        <h2 className="text-[15px] font-bold text-bg-100 mb-3 flex items-center gap-2">
          <span>🏆</span> 팀 순위
        </h2>
        <div className="bg-bg-card rounded-[14px] border border-bg-border overflow-hidden mb-8">
          {standingsLoading ? (
            <div className="p-6 space-y-3 animate-pulse">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="h-10 rounded-lg" style={{ background: "#1A2332" }} />
              ))}
            </div>
          ) : standings.length === 0 ? (
            <div className="p-12 text-center text-text-muted text-[14px]">시즌 준비 중입니다</div>
          ) : (
            <StandingsTable standings={standings} />
          )}
        </div>

        {/* ── Section 2: Player Rankings ── */}
        <h2 className="text-[15px] font-bold text-bg-100 mb-3 flex items-center gap-2">
          <span>⚽</span> 선수 순위
        </h2>

        {/* Player sub-tabs */}
        <div className="flex gap-2 mb-4">
          {([
            { key: "goals" as const, label: "득점" },
            { key: "assists" as const, label: "도움" },
            { key: "points" as const, label: "공격포인트" },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => { setPlayerTab(t.key); setShowAll(false); }}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                playerTab === t.key
                  ? "bg-emerald-500 text-white"
                  : "bg-bg-card border border-bg-border text-text-secondary hover:bg-bg-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-bg-card rounded-[14px] border border-bg-border overflow-hidden">
          {scorersLoading ? (
            <div className="p-6 space-y-3 animate-pulse">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-10 rounded-lg" style={{ background: "#1A2332" }} />
              ))}
            </div>
          ) : scorers.length === 0 ? (
            <div className="p-12 text-center text-text-muted text-[14px]">시즌 준비 중입니다</div>
          ) : (
            <>
              {/* TOP 4 Highlight */}
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-bg-border">
                {top4.map((s) => (
                  <Top4Card key={s.playerName} scorer={s} tab={playerTab} />
                ))}
              </div>

              {/* Full table */}
              <ScorersTable scorers={displayScorers} tab={playerTab} />

              {/* Show more */}
              {sortedScorers.length > 10 && !showAll && (
                <div className="p-3 text-center border-t border-bg-border">
                  <button
                    onClick={() => setShowAll(true)}
                    className="text-[13px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    더보기 ({sortedScorers.length - 10}명)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Standings Table ──
function StandingsTable({ standings }: { standings: Standing[] }) {
  const total = standings.length;

  // Collect unique zones for legend
  const zones = new Map<string, string>();
  standings.forEach((t) => {
    const color = getZoneColor(t.description, t.rank, total);
    if (!color) return;
    const d = t.description?.toLowerCase() ?? "";
    if (d.includes("champions league")) zones.set("챔피언스리그", "#10B981");
    else if (d.includes("europa league")) zones.set("유로파리그", "#F59E0B");
    else if (d.includes("conference league")) zones.set("컨퍼런스리그", "#3B82F6");
    else if (d.includes("relegation")) zones.set("강등권", "#EF4444");
    else if (t.rank <= 4 && !zones.has("챔피언스리그")) zones.set("챔피언스리그", "#10B981");
    else if (t.rank > total - 3 && !zones.has("강등권")) zones.set("강등권", "#EF4444");
  });

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-bg-border text-text-muted text-[11px] uppercase tracking-wider">
              <th className="text-left pl-4 pr-2 py-3 w-12">#</th>
              <th className="text-left py-3">팀</th>
              <th className="text-center py-3 hidden sm:table-cell w-12">경기</th>
              <th className="text-center py-3 hidden sm:table-cell w-10">승</th>
              <th className="text-center py-3 hidden sm:table-cell w-10">무</th>
              <th className="text-center py-3 hidden sm:table-cell w-10">패</th>
              <th className="text-center py-3 w-14">득실</th>
              <th className="text-center py-3 pr-4 w-14">승점</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team) => {
              const zoneColor = getZoneColor(team.description, team.rank, total);
              return (
                <tr
                  key={team.rank}
                  className="border-b border-bg-border/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="pl-1 pr-2 py-2.5">
                    <div className="flex items-center">
                      <span
                        className="w-[3px] h-6 rounded-full mr-2 shrink-0"
                        style={{ background: zoneColor ?? "transparent" }}
                      />
                      <span className="text-text-secondary font-mono-data text-[12px] w-5 text-center">
                        {team.rank}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <img
                        src={team.teamLogo}
                        alt={team.teamName}
                        className="w-6 h-6 object-contain shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <span className="text-bg-100 font-medium truncate">{team.teamName}</span>
                    </div>
                  </td>
                  <td className="text-center text-text-secondary hidden sm:table-cell">{team.played}</td>
                  <td className="text-center text-text-secondary hidden sm:table-cell">{team.win}</td>
                  <td className="text-center text-text-secondary hidden sm:table-cell">{team.draw}</td>
                  <td className="text-center text-text-secondary hidden sm:table-cell">{team.lose}</td>
                  <td className="text-center">
                    <span className={team.goalsDiff > 0 ? "text-emerald-400" : team.goalsDiff < 0 ? "text-red-400" : "text-text-secondary"}>
                      {team.goalsDiff > 0 ? `+${team.goalsDiff}` : team.goalsDiff}
                    </span>
                  </td>
                  <td className="text-center pr-4">
                    <span className="font-bold text-emerald-400 font-mono-data">{team.points}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      {zones.size > 0 && (
        <div className="flex flex-wrap items-center gap-4 px-4 py-3 text-[11px] text-text-muted border-t border-bg-border">
          {Array.from(zones.entries()).map(([label, color]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

// ── TOP 4 Card ──
const MEDAL: Record<number, { bg: string; border: string; text: string }> = {
  1: { bg: "#FBBF2418", border: "#FBBF2444", text: "#FBBF24" },
  2: { bg: "#94A3B818", border: "#94A3B844", text: "#94A3B8" },
  3: { bg: "#D9770618", border: "#D9770644", text: "#D97706" },
  4: { bg: "#8494A710", border: "#8494A730", text: "#8494A7" },
};

function Top4Card({ scorer, tab }: { scorer: Scorer; tab: "goals" | "assists" | "points" }) {
  const medal = MEDAL[scorer.rank] ?? MEDAL[4];
  const value =
    tab === "goals" ? scorer.goals :
    tab === "assists" ? scorer.assists :
    scorer.goals + scorer.assists;

  return (
    <div
      className="rounded-xl p-3 flex flex-col items-center text-center"
      style={{ background: medal.bg, border: `1px solid ${medal.border}` }}
    >
      {/* Rank badge */}
      <span
        className="text-[11px] font-bold mb-1.5 w-5 h-5 rounded-full flex items-center justify-center"
        style={{ background: medal.border, color: medal.text }}
      >
        {scorer.rank}
      </span>

      {/* Photo */}
      <img
        src={scorer.playerPhoto}
        alt={scorer.playerName}
        className="w-16 h-16 rounded-full object-cover bg-bg-700 mb-2"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "";
          (e.target as HTMLImageElement).className = "w-16 h-16 rounded-full bg-bg-700 mb-2";
        }}
      />

      {/* Name */}
      <span className="text-[13px] font-bold text-bg-100 truncate w-full">{scorer.playerName}</span>

      {/* Team */}
      <div className="flex items-center gap-1 mt-0.5 mb-1.5">
        <img
          src={scorer.teamLogo}
          alt=""
          className="w-4 h-4 object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span className="text-[11px] text-text-muted truncate">{scorer.teamName}</span>
      </div>

      {/* Value */}
      <span className="font-mono-data text-[22px] font-bold text-bg-50">{value}</span>
      <span className="text-[10px] text-text-muted">
        {tab === "goals" ? "골" : tab === "assists" ? "도움" : "공격P"}
      </span>
    </div>
  );
}

// ── Scorers Table ──
function ScorersTable({ scorers, tab }: { scorers: Scorer[]; tab: "goals" | "assists" | "points" }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-bg-border text-text-muted text-[11px] uppercase tracking-wider">
            <th className="text-left pl-4 pr-2 py-3 w-10">#</th>
            <th className="text-left py-3">선수</th>
            <th className="text-left py-3 hidden sm:table-cell">팀</th>
            <th className={`text-center py-3 w-14 ${tab === "goals" ? "text-emerald-400" : ""}`}>골</th>
            <th className={`text-center py-3 w-14 ${tab === "assists" ? "text-emerald-400" : ""}`}>도움</th>
            <th className={`text-center py-3 w-14 ${tab === "points" ? "text-emerald-400" : ""}`}>공격P</th>
            <th className="text-center py-3 pr-4 w-12 hidden sm:table-cell">경기</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((s) => (
            <tr
              key={`${s.playerName}-${s.rank}`}
              className="border-b border-bg-border/50 hover:bg-white/[0.02] transition-colors"
            >
              <td className="pl-4 pr-2 py-2.5">
                <span className="font-mono-data text-[12px] text-text-secondary">{s.rank}</span>
              </td>
              <td className="py-2.5">
                <div className="flex items-center gap-2">
                  <img
                    src={s.playerPhoto}
                    alt={s.playerName}
                    className="w-8 h-8 rounded-full object-cover bg-bg-700 shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className="text-bg-100 font-medium truncate">{s.playerName}</span>
                </div>
              </td>
              <td className="py-2.5 hidden sm:table-cell">
                <div className="flex items-center gap-1.5">
                  <img
                    src={s.teamLogo}
                    alt=""
                    className="w-5 h-5 object-contain shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className="text-text-secondary truncate text-[12px]">{s.teamName}</span>
                </div>
              </td>
              <td className="text-center">
                <span className={`font-mono-data ${tab === "goals" ? "font-bold text-[15px] text-bg-50" : "text-text-secondary"}`}>
                  {s.goals}
                </span>
              </td>
              <td className="text-center">
                <span className={`font-mono-data ${tab === "assists" ? "font-bold text-[15px] text-bg-50" : "text-text-secondary"}`}>
                  {s.assists}
                </span>
              </td>
              <td className="text-center">
                <span className={`font-mono-data ${tab === "points" ? "font-bold text-[15px] text-bg-50" : "text-text-secondary"}`}>
                  {s.goals + s.assists}
                </span>
              </td>
              <td className="text-center pr-4 hidden sm:table-cell">
                <span className="text-text-muted">{s.appearances}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
