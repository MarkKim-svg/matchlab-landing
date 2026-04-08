/**
 * ML 피처 백필 스크립트
 * - Notion 예측 DB에 피처 컬럼 추가 (Notion API는 자동 생성)
 * - 기존 경기의 fixture_id로 API-Football 데이터를 조회하여 피처 계산
 * - 계산된 피처를 Notion에 업데이트
 *
 * Usage: node scripts/backfill-features.mjs
 */

import { config } from "dotenv";
import { Client } from "@notionhq/client";

config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = "c451c2a04e6b4a7d85d0b8771e278d05";
const API_BASE = "https://v3.football.api-sports.io";
const API_KEY = process.env.FOOTBALL_API_KEY;

if (!API_KEY) {
  console.error("❌ FOOTBALL_API_KEY not set");
  process.exit(1);
}

// ── Derby list (from big-match.ts) ──
const DERBIES = [
  [["Manchester City", "Manchester United"]],
  [["Arsenal", "Tottenham"]],
  [["Liverpool", "Everton"]],
  [["Chelsea", "Tottenham"]],
  [["Chelsea", "Arsenal"]],
  [["Manchester United", "Liverpool"]],
  [["Manchester City", "Liverpool"]],
  [["Manchester United", "Arsenal"]],
  [["Real Madrid", "Barcelona"]],
  [["Real Madrid", "Atletico Madrid"]],
  [["Barcelona", "Atletico Madrid"]],
  [["Real Betis", "Sevilla"]],
  [["AC Milan", "Inter"]],
  [["Juventus", "Inter"]],
  [["Juventus", "AC Milan"]],
  [["AS Roma", "Lazio"]],
  [["Napoli", "Juventus"]],
  [["Borussia Dortmund", "Bayern Munich"]],
  [["Borussia Dortmund", "Schalke 04"]],
  [["Paris Saint Germain", "Marseille"]],
  [["Lyon", "Saint Etienne"]],
].map(([teams]) => teams.map(t => t.toLowerCase()));

function isDerby(homeName, awayName) {
  const h = homeName.toLowerCase();
  const a = awayName.toLowerCase();
  for (const [t1, t2] of DERBIES) {
    if (((h.includes(t1) || t1.includes(h)) && (a.includes(t2) || t2.includes(a))) ||
        ((h.includes(t2) || t2.includes(h)) && (a.includes(t1) || t1.includes(a)))) {
      return true;
    }
  }
  return false;
}

// ── Rate-limited API fetch ──
let lastApiCall = 0;
const MIN_INTERVAL = 110; // ~9 req/s to stay under 10/s

async function apiFetch(path) {
  const now = Date.now();
  const wait = MIN_INTERVAL - (now - lastApiCall);
  if (wait > 0) await sleep(wait);
  lastApiCall = Date.now();

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "x-apisports-key": API_KEY },
  });
  const json = await res.json();
  return json.response ?? [];
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Notion helpers ──
function richText(page, name) {
  return page.properties[name]?.rich_text?.map(t => t.plain_text).join("") ?? "";
}

function makeRichText(value) {
  const str = String(value ?? "");
  return { rich_text: [{ text: { content: str } }] };
}

// ── Create columns in Notion DB if they don't exist ──
const FEATURE_COLUMNS = [
  "홈팀_최근5경기_승점", "원정팀_최근5경기_승점",
  "홈팀_홈성적_승점", "원정팀_원정성적_승점",
  "순위차이", "H2H_홈승률",
  "홈팀_득실차", "원정팀_득실차",
  "일정피로_홈", "일정피로_원정",
  "더비여부",
  "홈팀_부상자수", "원정팀_부상자수",
];

async function ensureColumns() {
  // Fetch current DB schema
  const db = await notion.databases.retrieve({ database_id: DB_ID });
  const existing = new Set(Object.keys(db.properties));

  const toCreate = FEATURE_COLUMNS.filter(c => !existing.has(c));
  if (toCreate.length === 0) {
    console.log("  컬럼이 이미 모두 존재합니다.");
    return;
  }

  console.log(`  ${toCreate.length}개 컬럼 추가 중: ${toCreate.join(", ")}`);

  // Notion allows updating multiple properties at once
  const properties = {};
  for (const col of toCreate) {
    properties[col] = { rich_text: {} };
  }

  await notion.databases.update({
    database_id: DB_ID,
    properties,
  });

  console.log("  ✅ 컬럼 추가 완료");
}

// ── Fetch all predictions with fixture_id ──
async function fetchAllPredictions() {
  const results = [];
  let cursor = undefined;
  do {
    const res = await notion.databases.query({
      database_id: DB_ID,
      start_cursor: cursor,
      page_size: 100,
      sorts: [{ property: "날짜", direction: "descending" }],
    });
    results.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return results;
}

// ── Compute features for one fixture ──
async function computeFeatures(fixtureId, homeTeamId, awayTeamId) {
  // 1. Get fixture info
  const fixtureData = await apiFetch(`/fixtures?id=${fixtureId}`);
  const fixture = fixtureData[0];
  if (!fixture) throw new Error(`Fixture ${fixtureId} not found`);

  const hId = homeTeamId || fixture.teams?.home?.id;
  const aId = awayTeamId || fixture.teams?.away?.id;
  const leagueId = fixture.league?.id;
  const season = fixture.league?.season ?? 2025;
  const fixtureDate = fixture.fixture?.date?.split("T")[0] ?? "";
  const homeName = fixture.teams?.home?.name ?? "";
  const awayName = fixture.teams?.away?.name ?? "";

  // 2. Parallel API calls
  const [homeLast5, awayLast5, standingsData, h2hData, injuriesData, homeAllFixtures, awayAllFixtures] = await Promise.all([
    apiFetch(`/fixtures?team=${hId}&last=5`),
    apiFetch(`/fixtures?team=${aId}&last=5`),
    leagueId ? apiFetch(`/standings?league=${leagueId}&season=${season}`) : Promise.resolve([]),
    apiFetch(`/fixtures/headtohead?h2h=${hId}-${aId}&last=10`),
    apiFetch(`/injuries?fixture=${fixtureId}`),
    apiFetch(`/fixtures?team=${hId}&season=${season}&league=${leagueId}`),
    apiFetch(`/fixtures?team=${aId}&season=${season}&league=${leagueId}`),
  ]);

  // ── 홈팀_최근5경기_승점 / 원정팀_최근5경기_승점 ──
  function calcRecentPoints(fixtures, teamId) {
    let pts = 0;
    for (const f of fixtures) {
      const isHome = f.teams?.home?.id == teamId;
      const hg = f.goals?.home ?? 0;
      const ag = f.goals?.away ?? 0;
      const gf = isHome ? hg : ag;
      const ga = isHome ? ag : hg;
      if (gf > ga) pts += 3;
      else if (gf === ga) pts += 1;
    }
    return pts; // max 15
  }

  const homeRecent5Pts = calcRecentPoints(homeLast5, hId);
  const awayRecent5Pts = calcRecentPoints(awayLast5, aId);

  // ── 홈팀_홈성적_승점 / 원정팀_원정성적_승점 ──
  const allStandings = standingsData[0]?.league?.standings?.[0] ?? [];
  const homeSt = allStandings.find(s => s.team?.id == hId);
  const awaySt = allStandings.find(s => s.team?.id == aId);

  // home record from standings
  const homeHomePts = homeSt
    ? (homeSt.home?.win ?? 0) * 3 + (homeSt.home?.draw ?? 0)
    : "";
  const awayAwayPts = awaySt
    ? (awaySt.away?.win ?? 0) * 3 + (awaySt.away?.draw ?? 0)
    : "";

  // ── 순위차이 ──
  const homeRank = homeSt?.rank ?? null;
  const awayRank = awaySt?.rank ?? null;
  const rankDiff = (homeRank != null && awayRank != null) ? homeRank - awayRank : "";

  // ── H2H_홈승률 ──
  let homeH2HWins = 0;
  let h2hTotal = 0;
  for (const m of h2hData) {
    const hg = m.goals?.home ?? 0;
    const ag = m.goals?.away ?? 0;
    if (m.teams?.home?.id == hId) {
      h2hTotal++;
      if (hg > ag) homeH2HWins++;
    } else if (m.teams?.away?.id == hId) {
      h2hTotal++;
      if (ag > hg) homeH2HWins++;
    }
  }
  const h2hHomeWinRate = h2hTotal > 0 ? Math.round((homeH2HWins / h2hTotal) * 100) : "";

  // ── 홈팀_득실차 / 원정팀_득실차 ──
  const homeGD = homeSt?.goalsDiff ?? "";
  const awayGD = awaySt?.goalsDiff ?? "";

  // ── 일정피로 (days since last match) ──
  function calcFatigue(allFixtures, teamId, targetDate) {
    const finished = allFixtures
      .filter(f => f.fixture?.status?.short === "FT" && f.fixture?.date)
      .map(f => ({ date: f.fixture.date.split("T")[0], id: f.fixture.id }))
      .filter(f => f.date < targetDate)
      .sort((a, b) => b.date.localeCompare(a.date));

    if (finished.length === 0) return "";
    const lastDate = finished[0].date;
    const diff = Math.round((new Date(targetDate) - new Date(lastDate)) / (1000 * 60 * 60 * 24));
    return diff; // days since last match
  }

  const fatigue_home = calcFatigue(homeAllFixtures, hId, fixtureDate);
  const fatigue_away = calcFatigue(awayAllFixtures, aId, fixtureDate);

  // ── 더비여부 ──
  const derbyFlag = isDerby(homeName, awayName) ? "Y" : "N";

  // ── 부상자수 ──
  const homeInjuries = new Set();
  const awayInjuries = new Set();
  for (const inj of injuriesData) {
    const pName = (inj.player?.name ?? "").toLowerCase();
    if (!pName) continue;
    if (inj.team?.id == hId) homeInjuries.add(pName);
    else if (inj.team?.id == aId) awayInjuries.add(pName);
  }

  return {
    "홈팀_최근5경기_승점": String(homeRecent5Pts),
    "원정팀_최근5경기_승점": String(awayRecent5Pts),
    "홈팀_홈성적_승점": String(homeHomePts),
    "원정팀_원정성적_승점": String(awayAwayPts),
    "순위차이": String(rankDiff),
    "H2H_홈승률": h2hHomeWinRate !== "" ? `${h2hHomeWinRate}%` : "",
    "홈팀_득실차": String(homeGD),
    "원정팀_득실차": String(awayGD),
    "일정피로_홈": fatigue_home !== "" ? `${fatigue_home}일` : "",
    "일정피로_원정": fatigue_away !== "" ? `${fatigue_away}일` : "",
    "더비여부": derbyFlag,
    "홈팀_부상자수": String(homeInjuries.size),
    "원정팀_부상자수": String(awayInjuries.size),
  };
}

// ── Update Notion page ──
async function updateNotionPage(pageId, features) {
  const properties = {};
  for (const [key, value] of Object.entries(features)) {
    properties[key] = makeRichText(value);
  }
  await notion.pages.update({ page_id: pageId, properties });
}

// ── Main ──
async function main() {
  console.log("🔄 Step 1: Notion DB 컬럼 확인/추가...");
  await ensureColumns();

  console.log("\n🔄 Step 2: Notion 예측 DB에서 전체 경기 조회 중...");
  const allPages = await fetchAllPredictions();
  console.log(`  총 ${allPages.length}건 조회 완료`);

  // Filter pages with fixture_id
  const targets = allPages.filter(p => {
    const fid = richText(p, "fixture_id");
    return fid && fid.trim() !== "";
  });
  console.log(`  fixture_id가 있는 경기: ${targets.length}건\n`);

  let success = 0;
  let failed = 0;
  const failures = [];
  const samples = [];

  for (let i = 0; i < targets.length; i++) {
    const page = targets[i];
    const fixtureId = richText(page, "fixture_id");
    const match = page.properties["경기"]?.title?.[0]?.plain_text ?? "unknown";
    const date = page.properties["날짜"]?.date?.start ?? "";
    const homeTeamId = richText(page, "홈팀ID");
    const awayTeamId = richText(page, "원정팀ID");

    try {
      process.stdout.write(`[${i + 1}/${targets.length}] ${date} ${match} ... `);

      const features = await computeFeatures(fixtureId, homeTeamId, awayTeamId);
      await updateNotionPage(page.id, features);

      console.log("✅");
      success++;

      if (samples.length < 5) {
        samples.push({ match, date, ...features });
      }

      // 경기 간 0.5초 딜레이
      await sleep(500);
    } catch (err) {
      console.log(`❌ ${err.message}`);
      failed++;
      failures.push({ match, date, fixtureId, error: err.message });
    }
  }

  // ── 결과 출력 ──
  console.log("\n" + "=".repeat(60));
  console.log("📊 백필 결과");
  console.log("=".repeat(60));
  console.log(`  ✅ 성공: ${success} / ${targets.length}`);
  console.log(`  ❌ 실패: ${failed}`);

  if (failures.length > 0) {
    console.log("\n  실패 목록:");
    for (const f of failures) {
      console.log(`    - ${f.date} ${f.match} (fixture: ${f.fixtureId}): ${f.error}`);
    }
  }

  if (samples.length > 0) {
    console.log("\n📋 샘플 5건:");
    for (const s of samples) {
      console.log(`\n  ${s.date} ${s.match}`);
      console.log(`    최근5경기승점: 홈=${s["홈팀_최근5경기_승점"]} / 원정=${s["원정팀_최근5경기_승점"]}`);
      console.log(`    홈/원정성적승점: ${s["홈팀_홈성적_승점"]} / ${s["원정팀_원정성적_승점"]}`);
      console.log(`    순위차이: ${s["순위차이"]} | H2H홈승률: ${s["H2H_홈승률"]}`);
      console.log(`    득실차: ${s["홈팀_득실차"]} / ${s["원정팀_득실차"]}`);
      console.log(`    일정피로: ${s["일정피로_홈"]} / ${s["일정피로_원정"]}`);
      console.log(`    더비: ${s["더비여부"]} | 부상자: ${s["홈팀_부상자수"]} / ${s["원정팀_부상자수"]}`);
    }
  }

  console.log("\n✅ 백필 완료!");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
