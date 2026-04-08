"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AuthTabBar from "@/components/AuthTabBar";

const LEAGUES = [
  { id: "all", name: "전체" },
  { id: "39", name: "EPL" },
  { id: "140", name: "라리가" },
  { id: "135", name: "세리에A" },
  { id: "78", name: "분데스" },
  { id: "61", name: "리그1" },
  { id: "2", name: "UCL" },
  { id: "3", name: "UEL" },
  { id: "45", name: "FA Cup" },
  { id: "143", name: "코파" },
  { id: "137", name: "코파IT" },
  { id: "81", name: "DFB" },
  { id: "66", name: "쿠프" },
];

const MAIN_LEAGUES = ["39", "140", "135", "78", "61"];

interface Team { teamId: number; teamName: string; teamLogo: string; rank: number; points: number; leagueName?: string; }
interface SearchResult { type: "team" | "player"; id: number; name: string; photo: string; extra: string; }

export default function TeamsPage() {
  const [leagueId, setLeagueId] = useState("all");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Fetch teams
  useEffect(() => {
    setLoading(true);
    if (leagueId === "all") {
      // Fetch all main leagues in parallel
      Promise.all(
        MAIN_LEAGUES.map(lid =>
          fetch(`/api/standings?league=${lid}`).then(r => r.json()).then(d =>
            (d.standings ?? []).map((t: any) => ({ teamId: t.teamId, teamName: t.teamName, teamLogo: t.teamLogo, rank: t.rank, points: t.points, leagueName: LEAGUES.find(l => l.id === lid)?.name ?? "" }))
          ).catch(() => [])
        )
      ).then(results => setTeams(results.flat()))
        .finally(() => setLoading(false));
    } else {
      fetch(`/api/standings?league=${leagueId}`)
        .then(r => r.json())
        .then(d => setTeams((d.standings ?? []).map((t: any) => ({ teamId: t.teamId, teamName: t.teamName, teamLogo: t.teamLogo, rank: t.rank, points: t.points }))))
        .catch(() => setTeams([]))
        .finally(() => setLoading(false));
    }
  }, [leagueId]);

  // Debounced search via server API
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults([]); setShowResults(false); return; }
    setSearching(true);
    setShowResults(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      const results: SearchResult[] = [
        ...(data.teams ?? []).map((t: any) => ({ type: "team" as const, id: t.id, name: t.name, photo: t.logo, extra: t.country })),
        ...(data.players ?? []).map((p: any) => ({ type: "player" as const, id: p.id, name: p.name, photo: p.photo, extra: p.team })),
      ];
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  // Group teams by league for "all" view
  const groupedByLeague = leagueId === "all"
    ? MAIN_LEAGUES.map(lid => ({
        name: LEAGUES.find(l => l.id === lid)?.name ?? "",
        teams: teams.filter(t => t.leagueName === LEAGUES.find(l => l.id === lid)?.name),
      })).filter(g => g.teams.length > 0)
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A" }}>
      <Navbar />
      <AuthTabBar />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-8">
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#E1E7EF", marginBottom: "16px" }}>⚽ 팀/선수</h1>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="팀 또는 선수 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #334155", background: "#111827", color: "#E1E7EF", fontSize: "13px", outline: "none" }}
          />
          {showResults && !searching && searchResults.length > 0 && (() => {
            const teamResults = searchResults.filter(r => r.type === "team");
            const playerResults = searchResults.filter(r => r.type === "player");
            return (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px", zIndex: 50, background: "#1E293B", border: "1px solid #334155", borderRadius: "10px", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", maxHeight: "384px", overflowY: "auto" }} className="scrollbar-hide">
                {teamResults.length > 0 && (
                  <>
                    <div style={{ padding: "6px 14px", fontSize: "10px", fontWeight: 700, color: "#10B981", background: "#0F172A" }}>⚽ 팀</div>
                    {teamResults.map((r) => (
                      <Link key={`t-${r.id}`} href={`/team/${r.id}`} style={{ textDecoration: "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderBottom: "1px solid #263344" }} className="hover:bg-white/[0.03] transition-colors">
                          <img src={r.photo} alt="" style={{ width: "24px", height: "24px", objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 0 1px rgba(255,255,255,0.25))" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "#E1E7EF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                            <div style={{ fontSize: "10px", color: "#566378" }}>{r.extra}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
                {playerResults.length > 0 && (
                  <>
                    <div style={{ padding: "6px 14px", fontSize: "10px", fontWeight: 700, color: "#F59E0B", background: "#0F172A" }}>👤 선수</div>
                    {playerResults.map((r) => (
                      <Link key={`p-${r.id}`} href={`/player/${r.id}`} style={{ textDecoration: "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderBottom: "1px solid #263344" }} className="hover:bg-white/[0.03] transition-colors">
                          <img src={r.photo} alt="" style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, background: "#1E293B" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "#E1E7EF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                            <div style={{ fontSize: "10px", color: "#566378" }}>{r.extra}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            );
          })()}
          {showResults && !searching && query.length >= 2 && searchResults.length === 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px", padding: "12px", background: "#1E293B", border: "1px solid #334155", borderRadius: "10px", textAlign: "center", color: "#566378", fontSize: "12px" }}>검색 결과가 없습니다</div>
          )}
          {showResults && searching && <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px", padding: "12px", background: "#1E293B", border: "1px solid #334155", borderRadius: "10px", textAlign: "center", color: "#566378", fontSize: "12px" }}>검색 중...</div>}
        </div>

        {/* League tabs */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "20px" }} className="scrollbar-hide">
          {LEAGUES.map(l => (
            <button key={l.id} onClick={() => setLeagueId(l.id)} className="cursor-pointer" style={{ flexShrink: 0, padding: "6px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, background: l.id === leagueId ? "rgba(16,185,129,0.15)" : "#1E293B", color: l.id === leagueId ? "#34D399" : "#8494A7", border: l.id === leagueId ? "1px solid rgba(16,185,129,0.4)" : "1px solid #334155" }}>
              {l.name}
            </button>
          ))}
        </div>

        {/* Team grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px" }}>
            {Array.from({ length: 12 }, (_, i) => <div key={i} className="animate-pulse" style={{ height: "120px", borderRadius: "14px", background: "#1A2332" }} />)}
          </div>
        ) : groupedByLeague ? (
          // "전체" — grouped by league
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {groupedByLeague.map(g => (
              <div key={g.name}>
                <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#10B981", marginBottom: "10px" }}>{g.name}</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px" }}>
                  {g.teams.map(t => (
                    <Link key={t.teamId} href={`/team/${t.teamId}?league=${MAIN_LEAGUES.find(lid => LEAGUES.find(l => l.id === lid)?.name === g.name) ?? ""}`}>
                      <div style={{ background: "#111827", border: "1px solid #1E2D47", borderRadius: "12px", padding: "12px 8px", textAlign: "center" }} className="hover:border-emerald-500/30 transition-colors">
                        <img src={t.teamLogo} alt={t.teamName} style={{ width: "36px", height: "36px", objectFit: "contain", margin: "0 auto 6px", filter: "drop-shadow(0 0 1px rgba(255,255,255,0.25))" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        <div style={{ fontSize: "11px", fontWeight: 600, color: "#E1E7EF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.teamName}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Single league
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
