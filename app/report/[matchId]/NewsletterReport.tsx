"use client";

import Link from "next/link";
import { TeamLogo, LeagueBadge, ResultBadge, splitTeams, formatKoreanDate, fmtPct } from "@/components/match-ui";
import { KAKAO_CHANNEL_URL } from "@/lib/constants";
import type { MatchPrediction } from "@/lib/notion";
import type { MatchReport, ReportBlock, ReportRich, ReportSection } from "@/lib/notion";

function RichSpan({ parts }: { parts: ReportRich[] }) {
  return (
    <>
      {parts.map((p, i) => {
        let el: React.ReactNode = p.text;
        if (p.code) {
          el = (
            <code
              key={i}
              className="rounded px-1 py-0.5 text-[0.9em] font-mono-data"
              style={{ background: "#0F172A", color: "#fbbf24" }}
            >
              {el}
            </code>
          );
        }
        const style: React.CSSProperties = {};
        if (p.bold) style.fontWeight = 700;
        if (p.italic) style.fontStyle = "italic";
        if (p.color && p.color !== "default") {
          const c = p.color.replace("_background", "");
          const colorMap: Record<string, string> = {
            gray: "#94a3b8", brown: "#a78b5f", orange: "#fb923c",
            yellow: "#fbbf24", green: "#34d399", blue: "#60a5fa",
            purple: "#c084fc", pink: "#f472b6", red: "#f87171",
          };
          if (colorMap[c]) style.color = colorMap[c];
        }
        if (p.href) {
          return (
            <a key={i} href={p.href} target="_blank" rel="noopener noreferrer" className="underline" style={{ ...style, color: "#34d399" }}>
              {el}
            </a>
          );
        }
        return (
          <span key={i} style={style}>
            {el}
          </span>
        );
      })}
    </>
  );
}

function Block({ block }: { block: ReportBlock }) {
  switch (block.type) {
    case "paragraph":
      if (block.rich.length === 0) return <div className="h-2" />;
      return (
        <p className="text-[14px] leading-relaxed" style={{ color: "#d4d4d4" }}>
          <RichSpan parts={block.rich} />
        </p>
      );
    case "bullet":
      return (
        <div className="flex gap-2 text-[14px] leading-relaxed" style={{ color: "#d4d4d4" }}>
          <span style={{ color: "#10B981" }}>•</span>
          <span className="flex-1">
            <RichSpan parts={block.rich} />
          </span>
        </div>
      );
    case "number":
      return (
        <div className="flex gap-2 text-[14px] leading-relaxed" style={{ color: "#d4d4d4" }}>
          <span style={{ color: "#10B981" }}>·</span>
          <span className="flex-1">
            <RichSpan parts={block.rich} />
          </span>
        </div>
      );
    case "quote":
      return (
        <blockquote
          className="pl-3 text-[14px] leading-relaxed italic"
          style={{ borderLeft: "3px solid #10B981", color: "#8494A7" }}
        >
          <RichSpan parts={block.rich} />
        </blockquote>
      );
    case "callout":
      return (
        <div
          className="flex gap-2 rounded-lg p-3 text-[13px] leading-relaxed"
          style={{ background: "#0F172A", border: "1px solid #1E2D47", color: "#d4d4d4" }}
        >
          {block.icon && <span className="shrink-0">{block.icon}</span>}
          <div className="flex-1">
            <RichSpan parts={block.rich} />
          </div>
        </div>
      );
    default:
      return null;
  }
}

function SectionCard({ section, children }: { section: ReportSection; children?: React.ReactNode }) {
  return (
    <section
      className="rounded-xl p-5"
      style={{ background: "#1E293B", border: "1px solid #334155" }}
    >
      <h2 className="mb-3 text-[15px] font-bold" style={{ color: "#E1E7EF" }}>
        {section.heading}
      </h2>
      <div className="space-y-2.5">
        {section.blocks.map((b, i) => (
          <Block key={i} block={b} />
        ))}
      </div>
      {children}
    </section>
  );
}

/* -------- Ensemble probability card (reused in rationale section) -------- */

function ProbBar({ label, value, highlight }: { label: string; value: string; highlight: boolean }) {
  const { num, display } = fmtPct(value);
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 text-right text-[12px] shrink-0" style={{ color: "#8494A7" }}>
        {label}
      </span>
      <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "#0F172A" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(num, 100)}%`,
            background: highlight ? "#10B981" : "#475569",
          }}
        />
      </div>
      <span
        className="w-12 text-[12px] font-mono-data font-medium shrink-0"
        style={{ color: highlight ? "#34d399" : "#94a3b8" }}
      >
        {display}
      </span>
    </div>
  );
}

function EnsembleCard({ match }: { match: MatchPrediction }) {
  const ensHome = parseFloat(match.ensemble.home) || 0;
  const ensDraw = parseFloat(match.ensemble.draw) || 0;
  const ensAway = parseFloat(match.ensemble.away) || 0;
  const max = Math.max(ensHome, ensDraw, ensAway);
  return (
    <div
      className="mt-4 rounded-lg p-4"
      style={{ background: "#0F172A", border: "1px solid #1E2D47" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[12px] font-semibold" style={{ color: "#E1E7EF" }}>
          4-모델 앙상블 확률
        </span>
        {match.modelAgreement && (
          <span className="text-[11px]" style={{ color: "#8494A7" }}>
            일치도 {match.modelAgreement}
          </span>
        )}
      </div>
      <div className="space-y-2">
        <ProbBar label="홈승" value={match.ensemble.home} highlight={ensHome === max && max > 0} />
        <ProbBar label="무승부" value={match.ensemble.draw} highlight={ensDraw === max && max > 0} />
        <ProbBar label="원정승" value={match.ensemble.away} highlight={ensAway === max && max > 0} />
      </div>
    </div>
  );
}

/* -------- Pro overlay -------- */

function ProOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl"
         style={{ background: "rgba(15, 23, 42, 0.55)", backdropFilter: "blur(2px)" }}>
      <span className="text-3xl">🔒</span>
      <p className="mt-2 text-sm font-semibold text-white">Pro 전용 분석</p>
      <a
        href={KAKAO_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 transition"
      >
        카톡으로 구독 문의
      </a>
    </div>
  );
}

/* ============== main ============== */

export default function NewsletterReport({
  match,
  report,
  locked,
}: {
  match: MatchPrediction;
  report: MatchReport;
  locked: boolean;
}) {
  const [home, away] = splitTeams(match.match);

  // Identify "core rationale" section to inject ensemble card after
  const rationaleIdx = report.sections.findIndex(s =>
    /핵심 근거|📊/.test(s.heading)
  );

  // Pro sections = those after the first 2-3 public sections.
  // We treat sections indexed >= 3 as locked for Pro-only matches.
  const publicSectionCount = 3;

  return (
    <main className="min-h-screen" style={{ background: "#0F172A", color: "#E1E7EF" }}>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-5">
        {/* Back + date */}
        <div className="flex items-center justify-between">
          <Link
            href={`/matches/${match.date}`}
            className="text-sm transition"
            style={{ color: "#8494A7" }}
          >
            ← 목록으로
          </Link>
          <span className="text-sm" style={{ color: "#566378" }}>
            {formatKoreanDate(match.date)}
          </span>
        </div>

        {/* Header card — league + teams + confidence */}
        <header
          className="rounded-xl p-6 text-center"
          style={{ background: "#1E293B", border: "1px solid #334155" }}
        >
          <div className="mb-4 flex justify-center">
            <LeagueBadge league={match.league} />
          </div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex flex-col items-center gap-1.5">
              <TeamLogo teamId={match.homeTeamId} teamName={home} size={56} />
              <span className="text-[14px] font-semibold sm:text-[15px]">{home}</span>
            </div>
            <span className="text-[18px] font-bold" style={{ color: "#566378" }}>vs</span>
            <div className="flex flex-col items-center gap-1.5">
              <TeamLogo teamId={match.awayTeamId} teamName={away} size={56} />
              <span className="text-[14px] font-semibold sm:text-[15px]">{away}</span>
            </div>
          </div>

          {/* Confidence + prediction badges */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {match.confidenceLabel && (
              <span className="text-[13px]" style={{ color: "#d4d4d4" }}>
                {match.confidenceLabel}
              </span>
            )}
            {match.prediction && (
              <span
                className="inline-block rounded-lg px-3 py-1 text-[13px] font-bold"
                style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}
              >
                {match.prediction}
              </span>
            )}
          </div>

          {(match.isCorrect === "적중" || match.isCorrect === "미적중") && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <ResultBadge isCorrect={match.isCorrect} />
              {match.result && (
                <span className="text-sm" style={{ color: "#8494A7" }}>({match.result})</span>
              )}
            </div>
          )}
        </header>

        {/* Leading blocks (before any heading) */}
        {report.leadingBlocks.length > 0 && (
          <section
            className="rounded-xl p-5"
            style={{ background: "#1E293B", border: "1px solid #334155" }}
          >
            <div className="space-y-2.5">
              {report.leadingBlocks.map((b, i) => (
                <Block key={i} block={b} />
              ))}
            </div>
          </section>
        )}

        {/* Sections */}
        {report.sections.map((section, idx) => {
          const isLocked = locked && idx >= publicSectionCount;
          const card = (
            <SectionCard section={section}>
              {idx === rationaleIdx && <EnsembleCard match={match} />}
            </SectionCard>
          );
          if (!isLocked) return <div key={idx}>{card}</div>;
          return (
            <div key={idx} className="relative">
              <div className="pointer-events-none select-none" style={{ filter: "blur(10px)" }}>
                {card}
              </div>
              <ProOverlay />
            </div>
          );
        })}

        {/* If rationale section didn't exist, add ensemble as standalone */}
        {rationaleIdx === -1 && (
          <section
            className="rounded-xl p-5"
            style={{ background: "#1E293B", border: "1px solid #334155" }}
          >
            <h2 className="mb-3 text-[15px] font-bold" style={{ color: "#E1E7EF" }}>
              📊 모델 확률
            </h2>
            <EnsembleCard match={match} />
          </section>
        )}

        {/* Footer — transparency */}
        <div
          className="rounded-xl p-5 text-center"
          style={{ background: "#1E293B", border: "1px solid #334155" }}
        >
          <div className="mb-2 flex items-center justify-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34d399" }}
            >
              LIVE DATA
            </span>
          </div>
          <p className="text-sm" style={{ color: "#8494A7" }}>
            이 분석은 Notion DB에 사전 기록되었습니다
          </p>
          <a
            href="https://matchlab13.notion.site"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs hover:underline"
            style={{ color: "#34d399" }}
          >
            Notion에서 검증하기 →
          </a>
        </div>
      </div>
    </main>
  );
}
