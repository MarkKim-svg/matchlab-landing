"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import AuthTabBar from "@/components/AuthTabBar";

// ── League config ──
const LEAGUES = [
  { id: "39", name: "프리미어리그", logo: "https://media.api-sports.io/football/leagues/39.png", color: "#3D195B" },
  { id: "140", name: "라리가", logo: "https://media.api-sports.io/football/leagues/140.png", color: "#FF4B44" },
  { id: "135", name: "세리에A", logo: "https://media.api-sports.io/football/leagues/135.png", color: "#024494" },
  { id: "78", name: "분데스리가", logo: "https://media.api-sports.io/football/leagues/78.png", color: "#D20515" },
  { id: "61", name: "리그1", logo: "https://media.api-sports.io/football/leagues/61.png", color: "#091C3E" },
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

export default function StandingsPage() {
  const [leagueId, setLeagueId] = useState("39");
  const [tab, setTab] = useState<"standings" | "scorers">("standings");

  const [standings, setStandings] = useState<Standing[]>([]);
  const [scorers, setScorers] = useState<Scorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    setLoading(true);
    setFadeIn(false);

    const url =
      tab === "standings"
        ? `/api/standings?league=${leagueId}`
        : `/api/top-scorers?league=${leagueId}`;

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (tab === "standings") setStandings(d.standings ?? []);
        else setScorers(d.scorers ?? []);
      })
      .catch(() => {
        if (tab === "standings") setStandings([]);
        else setScorers([]);
      })
      .finally(() => {
        setLoading(false);
        requestAnimationFrame(() => setFadeIn(true));
      });
  }, [leagueId, tab]);

  const selectedLeague = LEAGUES.find((l) => l.id === leagueId)!;

  return (
    <div className="min-h-screen" style={{ background: "#0F172A" }}>
      <Navbar />
      <AuthTabBar />
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
        {/* ── League selector ── */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
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

        {/* ── Tab switcher ── */}
        <div className="flex gap-2 mb-5">
          {([
            { key: "standings", label: "순위표" },
            { key: "scorers", label: "득점 순위" },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                tab === t.key
                  ? "bg-emerald-500 text-white"
                  : "bg-bg-card border border-bg-border text-text-secondary hover:bg-bg-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div
          className="bg-bg-card rounded-[14px] border border-bg-border overflow-hidden transition-opacity duration-200"
          style={{ opacity: fadeIn ? 1 : 0 }}
        >
          {loading ? (
            <div className="p-8 space-y-3 animate-pulse">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="h-10 rounded-lg" style={{ background: "#1A2332" }} />
              ))}
            </div>
          ) : tab === "standings" ? (
            <StandingsTable standings={standings} />
          ) : (
            <ScorersTable scorers={scorers} />
          )}
        </div>
      </main>
    </div>
  );
}

// ── Standings Table ──
function StandingsTable({ standings }: { standings: Standing[] }) {
  if (standings.length === 0) {
    return (
      <div className="p-12 text-center text-text-muted text-[14px]">
        시즌 준비 중입니다
      </div>
    );
  }

  const total = standings.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-bg-border text-text-muted text-[11px] uppercase tracking-wider">
            <th className="text-left pl-4 pr-2 py-3 w-10">#</th>
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
            const isChamps = team.rank <= 4;
            const isRelegation = team.rank > total - 3;

            return (
              <tr
                key={team.rank}
                className="border-b border-bg-border/50 hover:bg-white/[0.02] transition-colors"
              >
                <td className="pl-1 pr-2 py-2.5">
                  <div className="flex items-center">
                    <span
                      className="w-[3px] h-6 rounded-full mr-2 shrink-0"
                      style={{
                        background: isChamps
                          ? "#10B981"
                          : isRelegation
                          ? "#EF4444"
                          : "transparent",
                      }}
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

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-3 text-[11px] text-text-muted border-t border-bg-border">
        <span className="flex items-center gap-1.5">
          <span className="w-[3px] h-3 rounded-full bg-emerald-500" /> 챔피언스리그
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-[3px] h-3 rounded-full bg-red-500" /> 강등권
        </span>
      </div>
    </div>
  );
}

// ── Scorers Table ──
function ScorersTable({ scorers }: { scorers: Scorer[] }) {
  if (scorers.length === 0) {
    return (
      <div className="p-12 text-center text-text-muted text-[14px]">
        시즌 준비 중입니다
      </div>
    );
  }

  const medalColors: Record<number, string> = {
    1: "#FBBF24",
    2: "#94A3B8",
    3: "#D97706",
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-bg-border text-text-muted text-[11px] uppercase tracking-wider">
            <th className="text-left pl-4 pr-2 py-3 w-10">#</th>
            <th className="text-left py-3">선수</th>
            <th className="text-left py-3 hidden sm:table-cell">팀</th>
            <th className="text-center py-3 w-14">골</th>
            <th className="text-center py-3 pr-4 w-14">어시</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((s) => {
            const medal = medalColors[s.rank];
            return (
              <tr
                key={s.rank}
                className="border-b border-bg-border/50 hover:bg-white/[0.02] transition-colors"
              >
                <td className="pl-4 pr-2 py-2.5">
                  <span
                    className="font-mono-data text-[12px] font-bold w-5 inline-block text-center"
                    style={{ color: medal ?? "#8494A7" }}
                  >
                    {s.rank}
                  </span>
                </td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2.5">
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
                  <div className="flex items-center gap-2">
                    <img
                      src={s.teamLogo}
                      alt={s.teamName}
                      className="w-5 h-5 object-contain shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <span className="text-text-secondary truncate text-[12px]">{s.teamName}</span>
                  </div>
                </td>
                <td className="text-center">
                  <span className="font-mono-data font-bold text-[16px] text-bg-50">{s.goals}</span>
                </td>
                <td className="text-center pr-4">
                  <span className="font-mono-data text-text-secondary">{s.assists ?? 0}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
