"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import AuthTabBar from "@/components/AuthTabBar";
import { LEAGUE_CONFIG } from "@/lib/constants";
import { TeamLogo, LeagueBadge, ResultBadge, splitTeams, formatKoreanDate, fmtPct } from "@/components/match-ui";
import { FormTable, StatsTable, H2HTable, InjuriesList, TopPlayersSection, MatchDetailSkeleton, type MatchDetail } from "@/components/report/MatchDetailTables";
import LineupPitch from "@/components/report/LineupPitch";
import type { MatchPrediction } from "@/lib/notion";
import type { MatchReport, ReportBlock, ReportRich, ReportSection } from "@/lib/notion";

function translateRound(round: string): string {
  if (!round) return "";
  const r = round.toLowerCase();
  if (r.includes("final") && !r.includes("quarter") && !r.includes("semi")) return "결승";
  if (r.includes("semi")) return r.includes("2nd") ? "4강 2차전" : r.includes("1st") ? "4강 1차전" : "4강";
  if (r.includes("quarter")) return r.includes("2nd") ? "8강 2차전" : r.includes("1st") ? "8강 1차전" : "8강";
  if (r.includes("round of 16")) return r.includes("2nd") ? "16강 2차전" : r.includes("1st") ? "16강 1차전" : "16강";
  if (r.includes("round of 32")) return "32강";
  const regMatch = round.match(/Regular Season\s*-?\s*(\d+)/i);
  if (regMatch) return `${regMatch[1]}라운드`;
  const groupMatch = round.match(/Group\s+([A-Z])/i);
  if (groupMatch) return `${groupMatch[1]}조`;
  return round;
}

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
    case "table":
      return <DataTable rows={block.tableRows ?? []} hasHeader={block.hasColumnHeader ?? false} />;
    default:
      return null;
  }
}

function DataTable({ rows, hasHeader }: { rows: ReportRich[][][]; hasHeader: boolean }) {
  if (rows.length === 0) return null;
  const headerRow = hasHeader ? rows[0] : null;
  const bodyRows = hasHeader ? rows.slice(1) : rows;

  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid #1E2D47" }}>
      <table className="w-full text-[13px]" style={{ minWidth: "320px" }}>
        {headerRow && (
          <thead>
            <tr style={{ borderBottom: "2px solid #1E2D47" }}>
              {headerRow.map((cell, i) => (
                <th
                  key={i}
                  className="text-left text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: "#FFFFFF", padding: "12px 16px", background: "#374151" }}
                >
                  <RichSpan parts={cell} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {bodyRows.map((row, ri) => (
            <tr
              key={ri}
              style={{
                background: ri % 2 === 0 ? "#0F172A" : "#1A2332",
                borderBottom: ri < bodyRows.length - 1 ? "1px solid #1E2D4766" : "none",
              }}
            >
              {row.map((cell, ci) => {
                const text = cell.map(c => c.text).join("");
                const isNumeric = /^[\d.,+\-%]+$/.test(text.trim());
                return (
                  <td
                    key={ci}
                    className={isNumeric ? "font-mono-data font-bold" : ""}
                    style={{
                      padding: "10px 16px",
                      color: isNumeric ? "#E1E7EF" : "#d4d4d4",
                    }}
                  >
                    <RichSpan parts={cell} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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
         style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(2px)" }}>
      <span className="text-3xl">🔒</span>
      <p className="mt-2 text-sm font-bold text-white">프리미엄 전용 분석</p>
      <p className="mt-1 text-xs text-center px-4" style={{ color: "#8494A7" }}>전술 분석 · 핵심 변수 · 상세 예측 데이터</p>
      <button
        onClick={() => window.location.href = "/pricing"}
        className="mt-3 rounded-lg px-5 py-2 text-xs font-bold text-white cursor-pointer"
        style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}
      >
        Pro 시작하기
      </button>
    </div>
  );
}

/* ============== main ============== */

export default function NewsletterReport({
  match,
  report,
  locked,
  matchDetail,
  detailLoading,
}: {
  match: MatchPrediction;
  report: MatchReport;
  locked: boolean;
  matchDetail?: MatchDetail | null;
  detailLoading?: boolean;
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
      <Navbar />
      <AuthTabBar />
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 pb-24 md:pb-8 space-y-5">
        {/* Back + date */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href={`/matches/${match.date}`} style={{ fontSize: "14px", color: "#8494A7" }} className="hover:text-emerald-400 transition">
            ← 목록으로
          </Link>
          <span style={{ fontSize: "13px", color: "#566378" }}>{formatKoreanDate(match.date)}</span>
        </div>

        {/* Header card */}
        <header style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "14px", padding: "40px 32px", textAlign: "center" }}>
          {/* Date + time */}
          <div style={{ fontSize: "14px", color: "#8494A7", marginBottom: "20px" }}>
            {formatKoreanDate(match.date)}
            {matchDetail?.fixtureInfo?.kickoffKST && (
              <span style={{ fontWeight: 600 }}> {matchDetail.fixtureInfo.kickoffKST} KST</span>
            )}
          </div>

          {/* League logo + name · round (same line) */}
          <div style={{ marginBottom: "28px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            {(() => {
              const config = LEAGUE_CONFIG[match.league];
              return config ? (
                <img src={config.logo} alt={match.league} style={{ width: "48px", height: "48px", objectFit: "contain" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ) : null;
            })()}
            <span style={{ fontSize: "18px", fontWeight: 600, color: "#E1E7EF" }}>
              {match.league}
              {matchDetail?.fixtureInfo?.round && (
                <span style={{ color: "#8494A7" }}> · {translateRound(matchDetail.fixtureInfo.round)}</span>
              )}
            </span>
          </div>

          {/* Teams */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "12px", marginBottom: "28px", overflow: "hidden" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", minWidth: 0 }}>
              <TeamLogo teamId={match.homeTeamId} teamName={home} size={88} />
              <span className="text-base md:text-[22px]" style={{ fontWeight: 700, color: "#E1E7EF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%", textAlign: "center" }}>{home}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              {match.result ? (
                <span style={{ fontSize: "36px", fontWeight: 700, color: "#E1E7EF", fontFamily: "'JetBrains Mono',monospace" }}>{match.result}</span>
              ) : (
                <span style={{ fontSize: "22px", fontWeight: 700, color: "#10B981" }}>VS</span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: 0 }}>
              <TeamLogo teamId={match.awayTeamId} teamName={away} size={88} />
              <span className="text-base md:text-[22px]" style={{ fontWeight: 700, color: "#E1E7EF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%", textAlign: "center" }}>{away}</span>
            </div>
          </div>

          {/* Confidence + prediction */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
            {match.confidenceLabel && (
              <span style={{ fontSize: "14px", color: "#d4d4d4" }}>{match.confidenceLabel}</span>
            )}
            {match.prediction && (
              <span style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", borderRadius: "8px", padding: "4px 12px", fontSize: "13px", fontWeight: 700 }}>
                {match.prediction}
              </span>
            )}
          </div>

          {(match.isCorrect === "적중" || match.isCorrect === "미적중") && (
            <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <ResultBadge isCorrect={match.isCorrect} />
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

        {/* Public sections (핵심 근거 등 상위 3개) */}
        {report.sections.slice(0, Math.min(publicSectionCount, report.sections.length)).map((section, idx) => (
          <div key={idx}>
            <SectionCard section={section}>
              {idx === rationaleIdx && <EnsembleCard match={match} />}
            </SectionCard>
          </div>
        ))}

        {/* Structured data from API-Football (Free/Pro 공통) — 줄글 위에 배치 */}
        {detailLoading ? (
          <MatchDetailSkeleton />
        ) : matchDetail && (
          <>
            <div className="space-y-5">
              <FormTable form={matchDetail.form} homeName={home} awayName={away} homeTeamId={match.homeTeamId} awayTeamId={match.awayTeamId} />
              <StatsTable stats={matchDetail.stats} homeName={home} awayName={away} homeTeamId={match.homeTeamId} awayTeamId={match.awayTeamId} />
              <H2HTable h2h={matchDetail.h2h} homeName={home} awayName={away} />
            </div>

            {locked ? (
              <div style={{ marginTop: "20px", borderTop: "2px solid #FBBF24", paddingTop: "20px" }}>
                <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "14px", padding: "24px", textAlign: "center" }}>
                  <span style={{ fontSize: "28px" }}>🔒</span>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "#E1E7EF", marginTop: "8px" }}>프리미엄 전용 분석</p>
                  <p style={{ fontSize: "12px", color: "#8494A7", marginTop: "4px", marginBottom: "16px" }}>아래 섹션은 Pro 구독자만 열람할 수 있습니다</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "center", marginBottom: "20px" }}>
                    {["⭐ 탑 플레이어", "📋 예상 라인업", "🏥 부상/출장정지", "📊 상세 분석 리포트"].map(t => (
                      <span key={t} style={{ fontSize: "13px", color: "#566378" }}>{t}</span>
                    ))}
                  </div>
                  <button onClick={() => window.location.href = "/pricing"} className="cursor-pointer" style={{ background: "linear-gradient(135deg, #d97706, #b45309)", color: "white", fontWeight: 700, fontSize: "14px", padding: "10px 24px", borderRadius: "10px", border: "none" }}>
                    Pro 시작하기
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5" style={{ marginTop: "20px" }}>
                {matchDetail.topPlayers && <TopPlayersSection topPlayers={matchDetail.topPlayers} homeName={home} awayName={away} />}
                {matchDetail.lineups && <LineupPitch lineups={matchDetail.lineups} homeName={home} awayName={away} isEstimated={matchDetail.isEstimatedLineup} isFinished={!!match.result} />}
                <InjuriesList injuries={matchDetail.injuries} />
              </div>
            )}
          </>
        )}

        {/* Remaining sections — Pro: 전체 오픈 / Free: 블러 */}
        {!locked && report.sections.length > publicSectionCount && (
          report.sections.slice(publicSectionCount).map((section, idx) => (
            <div key={`rest-${idx}`}>
              <SectionCard section={section} />
            </div>
          ))
        )}

        {/* Locked sections — Free 블러 */}
        {locked && report.sections.length > publicSectionCount && (
          <div className="relative">
            <div className="space-y-5 pointer-events-none select-none" style={{ filter: "blur(10px)" }}>
              {report.sections.slice(publicSectionCount).map((section, idx) => (
                <SectionCard key={idx} section={section} />
              ))}
            </div>
            <ProOverlay />
          </div>
        )}

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
