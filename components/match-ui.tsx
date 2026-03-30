"use client";

import { useState } from "react";
import { LEAGUE_CONFIG } from "@/lib/constants";

// --------------- team logo ---------------

export function TeamLogo({ teamId, teamName, size = 32 }: { teamId: string; teamName: string; size?: number }) {
  const [error, setError] = useState(false);

  if (!teamId || error) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-300 shrink-0"
        style={{ width: size, height: size }}
      >
        {teamName.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={`https://media.api-sports.io/football/teams/${teamId}.png`}
      alt={teamName}
      width={size}
      height={size}
      className="shrink-0 object-contain"
      onError={() => setError(true)}
    />
  );
}

// --------------- league badge ---------------

export function LeagueBadge({ league }: { league: string }) {
  const config = LEAGUE_CONFIG[league];

  if (!config) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-600/20 px-2.5 py-0.5 text-xs font-medium text-slate-400">
        {league || "기타"}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-white/90"
      style={{ backgroundColor: config.color + "33" }}
    >
      <img
        src={config.logo}
        alt={league}
        width={16}
        height={16}
        className="object-contain"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      {league}
    </span>
  );
}

// --------------- result badge ---------------

export function ResultBadge({ isCorrect }: { isCorrect: string }) {
  if (isCorrect === "적중")
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">✅ 적중</span>;
  if (isCorrect === "미적중")
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400">❌ 미적중</span>;
  return null;
}

// --------------- helpers ---------------

export function splitTeams(match: string): [string, string] {
  const sep = match.includes(" vs ") ? " vs " : "vs";
  const parts = match.split(sep);
  return [parts[0]?.trim() ?? match, parts[1]?.trim() ?? ""];
}

export function formatKoreanDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

export function getKSTToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}
