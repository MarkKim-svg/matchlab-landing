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

export default function MatchCarousel({ predictions, loading }: Props) {
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
          <span className="text-[14px] font-bold text-bg-100">오늘의 경기</span>
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

  return (
    <section>
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[16px]">🎯</span>
        <span className="text-[14px] font-bold text-bg-100">오늘의 경기</span>
        <span className="text-[12px] text-text-muted ml-1">{matches.length}경기</span>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-5 px-5"
        onMouseEnter={pauseAuto}
        onMouseLeave={resumeAuto}
        onTouchStart={pauseAuto}
        onTouchEnd={resumeAuto}
      >
        {matches.map((m) => {
          const [home, away] = splitTeams(m.match);
          return (
            <Link
              key={m.id}
              href={`/report/${m.id}`}
              className="snap-start shrink-0 w-[260px] rounded-xl p-3 border border-bg-border bg-bg-card hover:border-emerald-500/30 transition-all duration-200 flex flex-col items-center gap-2"
            >
              {/* League badge */}
              <LeagueBadge league={m.league} />

              {/* Teams */}
              <div className="flex items-center justify-center gap-1.5">
                <TeamLogo teamId={m.homeTeamId ?? ""} teamName={home} size={22} />
                <span className="text-[13px] font-bold text-bg-100 truncate">{home}</span>
                <span className="text-[11px] text-text-muted font-bold px-0.5">vs</span>
                <TeamLogo teamId={m.awayTeamId ?? ""} teamName={away} size={22} />
                <span className="text-[13px] font-bold text-bg-100 truncate">{away}</span>
              </div>

              {/* Stars */}
              <GoldStars count={m.confidence} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
