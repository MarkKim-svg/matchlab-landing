"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const LEAGUES = [
  { id: "39", name: "EPL" },
  { id: "140", name: "라리가" },
  { id: "135", name: "세리에A" },
  { id: "78", name: "분데스" },
  { id: "61", name: "리그1" },
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

export default function MiniStandings() {
  const [leagueId, setLeagueId] = useState("39");
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/standings?league=${leagueId}`)
      .then((r) => r.json())
      .then((d) => setStandings((d.standings ?? []).slice(0, 6)))
      .catch(() => setStandings([]))
      .finally(() => setLoading(false));
  }, [leagueId]);

  const selectedName = LEAGUES.find((l) => l.id === leagueId)?.name ?? "EPL";

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px]">🏆</span>
          <span className="text-[13px] font-bold text-bg-100">{selectedName} 순위</span>
        </div>
        <Link href="/standings" className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
          전체 순위 →
        </Link>
      </div>

      {/* League mini tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto scrollbar-hide">
        {LEAGUES.map((l) => (
          <button
            key={l.id}
            onClick={() => setLeagueId(l.id)}
            className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150 cursor-pointer ${
              l.id === leagueId
                ? "bg-emerald-500/15 text-emerald-400"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {l.name}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-1.5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-7 rounded" style={{ background: "#1A2332" }} />
          ))}
        </div>
      ) : standings.length === 0 ? (
        <div className="text-center py-4 text-[12px] text-text-muted">시즌 준비 중</div>
      ) : (
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-text-muted text-[10px] uppercase tracking-wider">
              <th className="text-left pl-1 pr-1 py-1 w-7">#</th>
              <th className="text-left py-1">팀</th>
              <th className="text-center py-1 w-7 hidden sm:table-cell">경기</th>
              <th className="text-center py-1 w-6 hidden sm:table-cell">승</th>
              <th className="text-center py-1 w-6 hidden sm:table-cell">무</th>
              <th className="text-center py-1 w-6 hidden sm:table-cell">패</th>
              <th className="text-center py-1 pr-1 w-8">승점</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((t) => (
              <tr key={t.rank} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-1.5 pl-1 pr-1">
                  <div className="flex items-center">
                    <span
                      className="w-[2px] h-4 rounded-full mr-1 shrink-0"
                      style={{ background: t.rank <= 4 ? "#10B981" : "transparent" }}
                    />
                    <span className="text-text-muted font-mono-data">{t.rank}</span>
                  </div>
                </td>
                <td className="py-1.5">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={t.teamLogo}
                      alt=""
                      className="w-4 h-4 object-contain shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <span className="text-bg-100 font-bold truncate">{t.teamName}</span>
                  </div>
                </td>
                <td className="text-center text-text-muted hidden sm:table-cell">{t.played}</td>
                <td className="text-center text-text-muted hidden sm:table-cell">{t.win}</td>
                <td className="text-center text-text-muted hidden sm:table-cell">{t.draw}</td>
                <td className="text-center text-text-muted hidden sm:table-cell">{t.lose}</td>
                <td className="text-center pr-1">
                  <span className="font-bold text-emerald-400 font-mono-data">{t.points}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
