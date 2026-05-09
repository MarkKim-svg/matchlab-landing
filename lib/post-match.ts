import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const POSTS_DB_ID = process.env.NOTION_POSTS_DB_ID || "ef6bea3fdacc4200a9d1a47ec11abbc8";

export type PostMatchStatus =
  | "pending"
  | "collecting"
  | "analyzing"
  | "published"
  | "failed";

export interface PostMatchKeyStat {
  label: string;
  value: string;
}

export interface PostMatchPredictedVsActual {
  prediction_label?: string;
  confidence?: number;
  actual_label?: string;
  hit?: boolean;
  reason_short?: string;
}

export interface PostMatchData {
  fixtureId: string;
  pageId: string;
  status: PostMatchStatus;
  publishedAt: string | null;
  match: string;
  date: string;
  league: string;
  hookTitle: string;
  content5dan: string;
  tacticalAnalysis: string;
  tacticalKeywords: string[];
  keyStat: PostMatchKeyStat | null;
  predictedVsActual: PostMatchPredictedVsActual | null;
  visualUrl: string | null;
  proPlayerImpact: unknown | null;
  proTacticalSimulation: unknown | null;
  errorMsg: string | null;
}

function getRichText(props: any, name: string): string {
  return props[name]?.rich_text?.map((t: any) => t.plain_text).join("") ?? "";
}

function safeJson<T = unknown>(s: string): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

function parsePostMatch(page: any): PostMatchData | null {
  const props = page.properties ?? {};
  const fixtureId = getRichText(props, "fixture_id");
  if (!fixtureId) return null;

  const statusName = (props["post_match_status"]?.select?.name ?? "pending") as PostMatchStatus;

  return {
    fixtureId,
    pageId: page.id,
    status: statusName,
    publishedAt: props["post_match_published_at"]?.date?.start ?? null,
    match: props["경기"]?.title?.[0]?.plain_text ?? "",
    date: props["날짜"]?.date?.start ?? "",
    league: props["리그"]?.select?.name ?? "",
    hookTitle: getRichText(props, "post_match_hook_title"),
    content5dan: getRichText(props, "post_match_content"),
    tacticalAnalysis: getRichText(props, "tactical_analysis"),
    tacticalKeywords:
      props["post_match_tactical_keywords"]?.multi_select?.map((m: any) => m.name) ?? [],
    keyStat: safeJson<PostMatchKeyStat>(getRichText(props, "post_match_key_stat")),
    predictedVsActual: safeJson<PostMatchPredictedVsActual>(
      getRichText(props, "predicted_vs_actual")
    ),
    visualUrl: props["post_match_visual_url"]?.url ?? null,
    proPlayerImpact: safeJson(getRichText(props, "pro_player_impact")),
    proTacticalSimulation: safeJson(getRichText(props, "pro_tactical_simulation")),
    errorMsg: getRichText(props, "post_match_error") || null,
  };
}

export async function getPostMatchByFixtureId(fixtureId: string): Promise<PostMatchData | null> {
  try {
    const res = await notion.databases.query({
      database_id: POSTS_DB_ID,
      page_size: 1,
      filter: {
        property: "fixture_id",
        rich_text: { equals: fixtureId },
      },
    });
    if (res.results.length === 0) return null;
    return parsePostMatch(res.results[0]);
  } catch (e) {
    console.error("[getPostMatchByFixtureId]", e);
    return null;
  }
}

/**
 * 본문 5단의 [[VISUAL: xg_bar]] 마커를 visualUrl로 치환된 segment 배열로 분해.
 * 텍스트 단락 사이에 이미지 삽입 위치 표시.
 */
export type ContentSegment =
  | { kind: "text"; text: string }
  | { kind: "visual"; visualType: string };

export function splitContentByVisualMarkers(content: string): ContentSegment[] {
  if (!content) return [];
  const re = /\[\[VISUAL:\s*([a-z_]+)\s*\]\]/g;
  const segments: ContentSegment[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    const before = content.slice(lastIdx, match.index).trim();
    if (before) segments.push({ kind: "text", text: before });
    segments.push({ kind: "visual", visualType: match[1] });
    lastIdx = match.index + match[0].length;
  }
  const tail = content.slice(lastIdx).trim();
  if (tail) segments.push({ kind: "text", text: tail });
  return segments;
}
