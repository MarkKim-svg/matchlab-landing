"use client";

import { useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { TeamLogo, LeagueBadge, splitTeams } from "@/components/match-ui";

interface Match {
  id: string;
  match: string;
  league: string;
  confidence: number;
  isProOnly: boolean;
  homeTeamId?: string;
  awayTeamId?: string;
}

interface Props {
  predictions: { matches: Match[] } | null;
  loading: boolean;
  isPro?: boolean;
}

function GoldStars({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="10" height="10" viewBox="0 0 20 20" fill={i < count ? "#FBBF24" : "#334155"}>
          <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.69l5.34-.78z" />
        </svg>
      ))}
    </span>
  );
}

export default function MatchCarousel({ predictions, loading, isPro }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  const matches = predictions?.matches ?? [];

  const scrollOneCard = useCallback(() => {
    const el = scrollRef.current;
    if (!el || matches.length <= 1) return;
    const cardWidth = (el.children[0] as HTMLElement)?.offsetWidth ?? 260;
    const gap = 12; // gap-3 = 0.75rem = 12px
    const step = cardWidth + gap;
    const maxScroll = el.scrollWidth - el.clientWidth;

    if (el.scrollLeft >= maxScroll - 2) {
      // At end → jump back to start
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollBy({ left: step, behavior: "smooth" });
    }
  }, [matches.length]);

  // Auto slide every 3s
  useEffect(() => {
    if (matches.length <= 1) return;
    intervalRef.current = setInterval(scrollOneCard, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [scrollOneCard, matches.length]);

  const pauseAuto = () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  const resumeAuto = useCallback(() => {
    if (matches.length <= 1) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(scrollOneCard, 3000);
  }, [scrollOneCard, matches.length]);

  if (loading) {
    return (
      <section>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[16px]">🎯</span>
          <span className="text-[14px] font-bold" style={{ color: "#E1E7EF" }}>오늘의 경기</span>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-[260px] shrink-0 h-[80px] rounded-xl animate-pulse" style={{ background: "#1A2332" }} />
          ))}
        </div>
      </section>
    );
  }

  if (matches.length === 0) return null;

  const highConfCount = matches.filter(m => m.confidence >= 4).length;
  const today = new Date().toISOString().split("T")[0];

  return (
    <section>
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[16px]">🎯</span>
        <span className="text-[14px] font-bold" style={{ color: "#E1E7EF" }}>오늘의 경기</span>
        <span className="text-[12px]" style={{ color: "#8494A7" }}>{matches.length}건</span>
        <span style={{ color: "#8494A7" }}>·</span>
        <span className="text-[12px] font-semibold" style={{ color: "#FBBF24" }}>고확신 ⭐4+ {highConfCount}건</span>
        <Link href={`/matches/${today}`} className="text-[12px] font-semibold ml-auto" style={{ color: "#10B981" }}>
          →
        </Link>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        onMouseEnter={pauseAuto}
        onMouseLeave={resumeAuto}
        onTouchStart={pauseAuto}
        onTouchEnd={resumeAuto}
      >
        {matches.map((m) => {
          const [home, away] = splitTeams(m.match);
          const locked = m.isProOnly && !isPro;
          return (
            <div
              key={m.id}
              onClick={() => { if (locked) { window.location.href = "/pricing"; } else { window.location.href = `/report/${m.id}`; } }}
              className="snap-start shrink-0 w-[240px] rounded-xl p-3 border border-bg-border bg-bg-card hover:border-emerald-500/30 transition-all duration-200 flex flex-col items-center gap-2 overflow-hidden cursor-pointer"
            >
              {/* League badge */}
              <LeagueBadge league={m.league} />

              {/* Teams */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", width: "100%", overflow: "hidden" }}>
                <TeamLogo teamId={m.homeTeamId ?? ""} teamName={home} size={18} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#E1E7EF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70px" }}>{home}</span>
                <span style={{ fontSize: "10px", color: "#566378", fontWeight: 700, flexShrink: 0 }}>vs</span>
                <TeamLogo teamId={m.awayTeamId ?? ""} teamName={away} size={18} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#E1E7EF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70px" }}>{away}</span>
              </div>

              {/* Stars */}
              <GoldStars count={m.confidence} />
              {locked && <span style={{ fontSize: "9px", color: "#F87171", fontWeight: 700 }}>🔒 Pro</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
