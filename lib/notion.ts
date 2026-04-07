import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_PREDICTIONS_DB_ID!;
const POSTS_DB_ID = process.env.NOTION_POSTS_DB_ID || "ef6bea3fdacc4200a9d1a47ec11abbc8";

export interface Prediction {
  date: string;
  match: string;
  league: string;
  prediction: string;
  confidence: number;
  confidenceLabel: string;
  result: string;
  isCorrect: boolean | null;
  isProOnly: boolean;
  homeTeamId: string;
  awayTeamId: string;
}

export interface MatchPrediction {
  id: string;
  match: string;
  date: string;
  league: string;
  prediction: string;
  confidence: number;
  confidenceLabel: string;
  isProOnly: boolean;
  poisson: { home: string; away: string };
  elo: { home: string; away: string };
  odds: { home: string; away: string };
  xg: { home: string; away: string };
  ensemble: { home: string; away: string; draw: string };
  aiAdjustment: string;
  modelAgreement: string;
  scorePrediction: string;
  result: string;
  isCorrect: string;
  fixtureId: string;
  homeTeamId: string;
  awayTeamId: string;
}

export interface WeeklyTrend {
  week_label: string;
  week_start: string;
  overall: { hit_rate: number; correct: number; total: number };
  high_confidence: { hit_rate: number; correct: number; total: number };
}

export interface DashboardData {
  overall: { hitRate: number; correct: number; total: number };
  highConfidence: { hitRate: number; correct: number; total: number };
  byLeague: Array<{ league: string; hitRate: number; correct: number; total: number }>;
  byConfidence: Array<{ stars: number; label: string; hitRate: number; correct: number; total: number }>;
  recentPredictions: Prediction[];
  weekly_trend: WeeklyTrend[];
}

async function fetchAllPredictions() {
  const results = [];
  let hasMore = true;
  let startCursor: string | undefined = undefined;

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      start_cursor: startCursor,
      page_size: 100,
      sorts: [{ property: "날짜", direction: "descending" }],
    });

    results.push(...response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor ?? undefined;
  }

  return results;
}

function parsePrediction(page: any): Prediction | null {
  const props = page.properties;

  const match = props["경기"]?.title?.[0]?.plain_text ?? "";
  const date = props["날짜"]?.date?.start ?? "";
  const league = props["리그"]?.select?.name ?? "";
  const prediction = props["예측"]?.select?.name ?? "";

  const confidenceLabel = props["확신도"]?.select?.name ?? "";
  const confidence = [...confidenceLabel].filter(c => c === "⭐").length;

  const hitStatus = props["적중여부"]?.select?.name ?? "";
  let isCorrect: boolean | null = null;
  if (hitStatus === "적중") isCorrect = true;
  else if (hitStatus === "미적중") isCorrect = false;

  const result = props["실제결과"]?.rich_text?.map((t: any) => t.plain_text).join("") ?? "";

  if (!date || !match) return null;

  const homeTeamId = props["홈팀ID"]?.rich_text?.map((t: any) => t.plain_text).join("") ?? "";
  const awayTeamId = props["원정팀ID"]?.rich_text?.map((t: any) => t.plain_text).join("") ?? "";

  return {
    date,
    match,
    league,
    prediction,
    confidence,
    confidenceLabel,
    result,
    isCorrect,
    isProOnly: confidence >= 4,
    homeTeamId,
    awayTeamId,
  };
}

function calcHitRate(predictions: Prediction[]): { hitRate: number; correct: number; total: number } {
  const judged = predictions.filter(p => p.isCorrect !== null);
  const correct = judged.filter(p => p.isCorrect === true).length;
  const total = judged.length;
  const hitRate = total > 0 ? Math.round((correct / total) * 1000) / 10 : 0;
  return { hitRate, correct, total };
}

function getTextProp(props: any, name: string): string {
  return props[name]?.rich_text?.map((t: any) => t.plain_text).join("") ?? "";
}

function parseMatchPrediction(page: any): MatchPrediction | null {
  const props = page.properties;

  const match = props["경기"]?.title?.[0]?.plain_text ?? "";
  const date = props["날짜"]?.date?.start ?? "";
  const league = props["리그"]?.select?.name ?? "";
  const prediction = props["예측"]?.select?.name ?? "";

  const confidenceLabel = props["확신도"]?.select?.name ?? "";
  const confidence = [...confidenceLabel].filter(c => c === "⭐").length;

  if (!date || !match) return null;

  return {
    id: page.id,
    match,
    date,
    league,
    prediction,
    confidence,
    confidenceLabel,
    isProOnly: confidence >= 4,
    poisson: { home: getTextProp(props, "푸아송_홈승"), away: getTextProp(props, "푸아송_원정승") },
    elo: { home: getTextProp(props, "ELO_홈승"), away: getTextProp(props, "ELO_원정승") },
    odds: { home: getTextProp(props, "배당_홈승"), away: getTextProp(props, "배당_원정승") },
    xg: { home: getTextProp(props, "xG_홈"), away: getTextProp(props, "xG_원정") },
    ensemble: {
      home: getTextProp(props, "통계모델_홈승"),
      away: getTextProp(props, "통계모델_원정승"),
      draw: getTextProp(props, "통계모델_무승부"),
    },
    aiAdjustment: getTextProp(props, "AI조정"),
    modelAgreement: getTextProp(props, "모델일치"),
    scorePrediction: getTextProp(props, "스코어예측"),
    result: getTextProp(props, "실제결과"),
    isCorrect: props["적중여부"]?.select?.name ?? "미판정",
    fixtureId: getTextProp(props, "fixture_id"),
    homeTeamId: getTextProp(props, "홈팀ID"),
    awayTeamId: getTextProp(props, "원정팀ID"),
  };
}

export async function getPredictionsByDate(dateStr: string): Promise<MatchPrediction[]> {
  const results = [];
  let hasMore = true;
  let startCursor: string | undefined = undefined;

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      start_cursor: startCursor,
      page_size: 100,
      filter: {
        property: "날짜",
        date: { equals: dateStr },
      },
    });

    results.push(...response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor ?? undefined;
  }

  const predictions = results
    .map(parseMatchPrediction)
    .filter((p): p is MatchPrediction => p !== null);

  predictions.sort((a, b) => b.confidence - a.confidence);

  return predictions;
}

export async function getPredictionById(pageId: string): Promise<MatchPrediction | null> {
  const page = await notion.pages.retrieve({ page_id: pageId });
  return parseMatchPrediction(page);
}

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d);
  mon.setDate(diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function calcWeeklyTrend(predictions: Prediction[]): WeeklyTrend[] {
  const now = new Date();
  const currentMonday = getMonday(now);

  // Build week buckets for last 8 weeks
  const weeks: { start: Date; end: Date }[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = new Date(currentMonday);
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    weeks.push({ start, end });
  }

  const judgedPreds = predictions.filter(p => p.isCorrect !== null && p.date);

  const result: WeeklyTrend[] = [];
  for (const week of weeks) {
    const weekStart = week.start.toISOString().split("T")[0];
    const weekEnd = week.end.toISOString().split("T")[0];

    const weekPreds = judgedPreds.filter(p => p.date >= weekStart && p.date <= weekEnd);
    if (weekPreds.length === 0) continue;

    const highConfPreds = weekPreds.filter(p => p.confidence >= 4);

    const overallCorrect = weekPreds.filter(p => p.isCorrect === true).length;
    const highCorrect = highConfPreds.filter(p => p.isCorrect === true).length;

    const sm = week.start.getMonth() + 1;
    const sd = week.start.getDate();
    const em = week.end.getMonth() + 1;
    const ed = week.end.getDate();

    result.push({
      week_label: `${sm}/${sd}~${em}/${ed}`,
      week_start: weekStart,
      overall: {
        hit_rate: Math.round((overallCorrect / weekPreds.length) * 1000) / 10,
        correct: overallCorrect,
        total: weekPreds.length,
      },
      high_confidence: {
        hit_rate: highConfPreds.length > 0
          ? Math.round((highCorrect / highConfPreds.length) * 1000) / 10
          : 0,
        correct: highCorrect,
        total: highConfPreds.length,
      },
    });
  }

  return result;
}

export async function getDashboardData(period: string = "all"): Promise<DashboardData> {
  const pages = await fetchAllPredictions();
  let predictions = pages.map(parsePrediction).filter((p): p is Prediction => p !== null);

  if (period !== "all") {
    const now = new Date();
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 0;
    if (days > 0) {
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const cutoffStr = cutoff.toISOString().split("T")[0];
      predictions = predictions.filter(p => p.date >= cutoffStr);
    }
  }

  const overall = calcHitRate(predictions);

  const highConf = predictions.filter(p => p.confidence >= 4);
  const highConfidence = calcHitRate(highConf);

  const leagueMap = new Map<string, Prediction[]>();
  predictions.forEach(p => {
    if (!p.league) return;
    if (!leagueMap.has(p.league)) leagueMap.set(p.league, []);
    leagueMap.get(p.league)!.push(p);
  });
  const byLeague = Array.from(leagueMap.entries())
    .map(([league, preds]) => ({ league, ...calcHitRate(preds) }))
    .sort((a, b) => b.total - a.total);

  const confMap = new Map<number, Prediction[]>();
  predictions.forEach(p => {
    if (p.confidence === 0) return;
    if (!confMap.has(p.confidence)) confMap.set(p.confidence, []);
    confMap.get(p.confidence)!.push(p);
  });
  const starLabels: Record<number, string> = { 1: "⭐", 2: "⭐⭐", 3: "⭐⭐⭐", 4: "⭐⭐⭐⭐", 5: "⭐⭐⭐⭐⭐" };
  const byConfidence = Array.from(confMap.entries())
    .map(([stars, preds]) => ({ stars, label: starLabels[stars] || "", ...calcHitRate(preds) }))
    .sort((a, b) => a.stars - b.stars);

  const recentPredictions = predictions
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20);

  // Weekly trend — always last 8 weeks regardless of period filter
  const allPreds = pages.map(parsePrediction).filter((p): p is Prediction => p !== null);
  const weekly_trend = calcWeeklyTrend(allPreds);

  return { overall, highConfidence, byLeague, byConfidence, recentPredictions, weekly_trend };
}

/* =============== Match Report (from Posts DB) =============== */

export interface ReportRich {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  color?: string;
  href?: string | null;
}

export type ReportBlockType =
  | "paragraph"
  | "bullet"
  | "number"
  | "quote"
  | "callout"
  | "divider"
  | "heading"
  | "table";

export interface ReportBlock {
  type: ReportBlockType;
  level?: number;
  icon?: string;
  rich: ReportRich[];
  tableRows?: ReportRich[][][];  // rows → cells → rich parts
  hasColumnHeader?: boolean;
}

export interface ReportSection {
  heading: string; // e.g. "📝 경기 프리뷰"
  blocks: ReportBlock[];
}

export interface MatchReport {
  title: string;
  postDate: string;
  leadingBlocks: ReportBlock[];
  sections: ReportSection[];
}

function parseRich(items: any[]): ReportRich[] {
  if (!Array.isArray(items)) return [];
  return items.map((t: any) => ({
    text: t.plain_text ?? "",
    bold: !!t.annotations?.bold,
    italic: !!t.annotations?.italic,
    code: !!t.annotations?.code,
    color: t.annotations?.color,
    href: t.href ?? null,
  }));
}

async function fetchAllBlocks(pageId: string): Promise<any[]> {
  const out: any[] = [];
  let cursor: string | undefined = undefined;
  let hasMore = true;
  while (hasMore) {
    const res = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });
    out.push(...res.results);
    hasMore = res.has_more;
    cursor = res.next_cursor ?? undefined;
  }

  // Fetch table children
  const withChildren: any[] = [];
  for (const block of out) {
    if (block.type === "table" && block.has_children) {
      const rows: any[] = [];
      let rc: string | undefined = undefined;
      let rm = true;
      while (rm) {
        const rr = await notion.blocks.children.list({
          block_id: block.id,
          start_cursor: rc,
          page_size: 100,
        });
        rows.push(...rr.results);
        rm = rr.has_more;
        rc = rr.next_cursor ?? undefined;
      }
      withChildren.push({ ...block, _tableRows: rows });
    } else {
      withChildren.push(block);
    }
  }
  return withChildren;
}

function blockToReport(b: any): ReportBlock | null {
  const t = b.type;
  switch (t) {
    case "heading_1":
      return { type: "heading", level: 1, rich: parseRich(b.heading_1?.rich_text ?? []) };
    case "heading_2":
      return { type: "heading", level: 2, rich: parseRich(b.heading_2?.rich_text ?? []) };
    case "heading_3":
      return { type: "heading", level: 3, rich: parseRich(b.heading_3?.rich_text ?? []) };
    case "paragraph":
      return { type: "paragraph", rich: parseRich(b.paragraph?.rich_text ?? []) };
    case "bulleted_list_item":
      return { type: "bullet", rich: parseRich(b.bulleted_list_item?.rich_text ?? []) };
    case "numbered_list_item":
      return { type: "number", rich: parseRich(b.numbered_list_item?.rich_text ?? []) };
    case "quote":
      return { type: "quote", rich: parseRich(b.quote?.rich_text ?? []) };
    case "callout":
      return {
        type: "callout",
        icon: b.callout?.icon?.emoji ?? "",
        rich: parseRich(b.callout?.rich_text ?? []),
      };
    case "divider":
      return { type: "divider", rich: [] };
    case "table": {
      const rows = (b._tableRows ?? []).map((row: any) => {
        const cells = row.table_row?.cells ?? [];
        return cells.map((cell: any) => parseRich(cell));
      });
      return {
        type: "table",
        rich: [],
        tableRows: rows,
        hasColumnHeader: b.table?.has_column_header ?? false,
      };
    }
    default:
      return null;
  }
}

function richToPlain(r: ReportRich[]): string {
  return r.map(x => x.text).join("").trim();
}

const SECTION_EMOJI_RE = /^(📝|⚽|📊|📈|🔍|⚡|🎯|⚠️)\s/;

function blocksToReport(blocks: any[]): { leadingBlocks: ReportBlock[]; sections: ReportSection[] } {
  const parsed: ReportBlock[] = blocks
    .map(blockToReport)
    .filter((b): b is ReportBlock => b !== null);

  // Promote emoji-prefixed paragraphs to virtual headings
  const promoted: ReportBlock[] = parsed.map(b => {
    if (b.type === "paragraph") {
      const plain = richToPlain(b.rich);
      if (SECTION_EMOJI_RE.test(plain)) {
        return { ...b, type: "heading" as ReportBlockType, level: 2 };
      }
    }
    return b;
  });

  const leadingBlocks: ReportBlock[] = [];
  const sections: ReportSection[] = [];
  let current: ReportSection | null = null;

  for (const b of promoted) {
    if (b.type === "heading") {
      const h = richToPlain(b.rich);
      if (!h) continue;
      current = { heading: h, blocks: [] };
      sections.push(current);
      continue;
    }
    if (b.type === "divider") continue;

    // Skip empty paragraphs (visual noise in card layout)
    if (b.type === "paragraph" && richToPlain(b.rich) === "") continue;

    if (current) current.blocks.push(b);
    else leadingBlocks.push(b);
  }

  return { leadingBlocks, sections };
}

async function findPostPage(matchName: string, dateStr: string): Promise<{ id: string; title: string; postDate: string } | null> {
  // 1차: 경기명 + 날짜 복합 필터
  try {
    const res = await notion.databases.query({
      database_id: POSTS_DB_ID,
      page_size: 10,
      filter: {
        and: [
          { property: "경기", title: { equals: matchName } },
          { property: "날짜", date: { equals: dateStr } },
        ],
      },
    });
    if (res.results.length > 0) {
      const page: any = res.results[0];
      return {
        id: page.id,
        title: page.properties?.["경기"]?.title?.[0]?.plain_text ?? matchName,
        postDate: page.properties?.["날짜"]?.date?.start ?? dateStr,
      };
    }
  } catch (e: any) {
    // 1차 필터 실패(필드명 다름 등) → 2차로
    console.error("[findPostPage] primary filter failed:", e?.message || e);
  }

  // 2차 폴백: 경기명만으로 검색 → 날짜 가장 가까운 것 선택
  try {
    const res = await notion.databases.query({
      database_id: POSTS_DB_ID,
      page_size: 20,
      filter: {
        property: "경기",
        title: { equals: matchName },
      },
    });
    if (res.results.length === 0) return null;

    const target = new Date(dateStr).getTime();
    let best: any = null;
    let bestDiff = Infinity;
    for (const page of res.results) {
      const d = (page as any).properties?.["날짜"]?.date?.start;
      if (!d) continue;
      const diff = Math.abs(new Date(d).getTime() - target);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = page;
      }
    }
    if (!best) return null;
    return {
      id: best.id,
      title: best.properties?.["경기"]?.title?.[0]?.plain_text ?? matchName,
      postDate: best.properties?.["날짜"]?.date?.start ?? dateStr,
    };
  } catch (e: any) {
    console.error("[findPostPage] fallback failed:", e?.message || e);
    return null;
  }
}

export async function getMatchReport(matchName: string, dateStr: string): Promise<MatchReport | null> {
  const found = await findPostPage(matchName, dateStr);
  if (!found) return null;

  const blocks = await fetchAllBlocks(found.id);
  const { leadingBlocks, sections } = blocksToReport(blocks);

  if (sections.length === 0 && leadingBlocks.length === 0) return null;

  return {
    title: found.title,
    postDate: found.postDate,
    leadingBlocks,
    sections,
  };
}

