"use client";

import { useRef, useState, useEffect, useCallback } from "react";
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
        <svg key={i} width="12" height="12" viewBox="0 0 20 20" fill={i < count ? "#FBBF24" : "#334155"}>
          <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.69l5.34-.78z" />
        </svg>
      ))}
    </span>
  );
}

export default function MatchCarousel({ predictions, loading }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  const matches = predictions?.matches ?? [];

  const scrollTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const child = el.children[index] as HTMLElement | undefined;
    if (child) {
      el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: "smooth" });
    }
  }, []);

  const next = useCallback(() => {
    if (matches.length === 0) return;
    const n = (current + 1) % matches.length;
    setCurrent(n);
    scrollTo(n);
  }, [current, matches.length, scrollTo]);

  const prev = useCallback(() => {
    if (matches.length === 0) return;
    const n = (current - 1 + matches.length) % matches.length;
    setCurrent(n);
    scrollTo(n);
  }, [current, matches.length, scrollTo]);

  // Auto slide
  useEffect(() => {
    if (matches.length <= 1) return;
    intervalRef.current = setInterval(next, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [next, matches.length]);

  // Sync current index on manual scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const scrollLeft = el.scrollLeft;
      const childWidth = (el.children[0] as HTMLElement)?.offsetWidth ?? 1;
      const idx = Math.round(scrollLeft / childWidth);
      setCurrent(Math.min(idx, matches.length - 1));
    };
    el.addEventListener("scrollend", onScroll);
    return () => el.removeEventListener("scrollend", onScroll);
  }, [matches.length]);

  // Pause auto-slide on hover/touch
  const pauseAuto = () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  const resumeAuto = () => {
    if (matches.length <= 1) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, 3000);
  };

  if (loading) {
    return (
      <section>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[16px]">🎯</span>
          <span className="text-[14px] font-bold text-bg-100">오늘의 경기</span>
        </div>
        <div className="h-[88px] rounded-xl animate-pulse" style={{ background: "#1A2332" }} />
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
        className="relative"
        onMouseEnter={pauseAuto}
        onMouseLeave={resumeAuto}
        onTouchStart={pauseAuto}
        onTouchEnd={resumeAuto}
      >
        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollBehavior: "smooth" }}
        >
          {matches.map((m) => {
            const [home, away] = splitTeams(m.match);
            const isHigh = m.confidence >= 4;
            return (
              <Link
                key={m.id}
                href={`/report/${m.id}`}
                className="snap-start shrink-0 w-full rounded-xl p-4 flex items-center gap-3 transition-all duration-200 hover:border-emerald-500/30"
                style={{
                  background: "linear-gradient(145deg, #1A2332, #1E293B)",
                  border: isHigh ? "1px solid #F59E0B44" : "1px solid #263344",
                }}
              >
                {/* League */}
                <div className="shrink-0 hidden sm:block">
                  <LeagueBadge league={m.league} />
                </div>

                {/* Teams */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <TeamLogo teamId={m.homeTeamId ?? ""} teamName={home} size={28} />
                  <span className="text-[14px] font-bold text-bg-50 truncate">{home}</span>
                  <span className="text-[12px] text-text-muted font-bold px-1">VS</span>
                  <TeamLogo teamId={m.awayTeamId ?? ""} teamName={away} size={28} />
                  <span className="text-[14px] font-bold text-bg-50 truncate">{away}</span>
                </div>

                {/* Stars + League mobile */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <GoldStars count={m.confidence} />
                  <span className="sm:hidden text-[10px] text-text-muted">{m.league}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Arrows */}
        {matches.length > 1 && (
          <>
            <button
              onClick={() => { pauseAuto(); prev(); resumeAuto(); }}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-bg-deep/80 backdrop-blur flex items-center justify-center text-text-secondary hover:text-white hover:bg-bg-deep transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button
              onClick={() => { pauseAuto(); next(); resumeAuto(); }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-bg-deep/80 backdrop-blur flex items-center justify-center text-text-secondary hover:text-white hover:bg-bg-deep transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {matches.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {matches.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); scrollTo(i); }}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === current
                  ? "w-5 h-1.5 bg-emerald-400"
                  : "w-1.5 h-1.5 bg-text-muted/40 hover:bg-text-muted"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
