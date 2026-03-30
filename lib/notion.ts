import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_PREDICTIONS_DB_ID!;

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

export interface DashboardData {
  overall: { hitRate: number; correct: number; total: number };
  highConfidence: { hitRate: number; correct: number; total: number };
  byLeague: Array<{ league: string; hitRate: number; correct: number; total: number }>;
  byConfidence: Array<{ stars: number; label: string; hitRate: number; correct: number; total: number }>;
  recentPredictions: Prediction[];
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

  return { overall, highConfidence, byLeague, byConfidence, recentPredictions };
}
