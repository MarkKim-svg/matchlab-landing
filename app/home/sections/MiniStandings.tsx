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
        <div className="space-y-0.5">
          {standings.map((t) => (
            <div
              key={t.rank}
              className="flex items-center gap-2 py-1.5 px-1 rounded-md hover:bg-white/[0.02] transition-colors"
            >
              {/* Zone bar + rank */}
              <div className="flex items-center w-7 shrink-0">
                <span
                  className="w-[2px] h-4 rounded-full mr-1.5"
                  style={{ background: t.rank <= 4 ? "#10B981" : "transparent" }}
                />
                <span className="text-[11px] text-text-muted font-mono-data">{t.rank}</span>
              </div>

              {/* Team */}
              <img
                src={t.teamLogo}
                alt=""
                className="w-4 h-4 object-contain shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <span className="text-[12px] text-bg-100 truncate flex-1">{t.teamName}</span>

              {/* Points */}
              <span className="text-[12px] font-bold text-emerald-400 font-mono-data shrink-0 w-7 text-right">
                {t.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
