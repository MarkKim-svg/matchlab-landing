import { config } from "dotenv";
import { Client } from "@notionhq/client";

config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = "c451c2a04e6b4a7d85d0b8771e278d05";

// 1. Fetch all pages with pagination
async function fetchAll() {
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

function prop(page, name) {
  return page.properties[name];
}

function txt(p) {
  return p?.title?.[0]?.plain_text ?? p?.rich_text?.map(t => t.plain_text).join("") ?? "";
}

function sel(p) {
  return p?.select?.name ?? "";
}

function num(p) {
  return p?.number ?? null;
}

async function main() {
  console.log("⏳ Notion 예측 DB에서 데이터를 가져오는 중...\n");
  const pages = await fetchAll();
  console.log(`총 ${pages.length}건 fetch 완료.\n`);

  // 2. Filter ⭐⭐⭐ only
  const filtered = pages.filter(p => sel(prop(p, "확신도")) === "⭐⭐⭐");
  console.log(`확신도 ⭐⭐⭐ 경기: ${filtered.length}건\n`);
  console.log("=".repeat(80));

  const records = [];

  // 3. Print each match
  for (const page of filtered) {
    const match = txt(prop(page, "경기"));
    const date = prop(page, "날짜")?.date?.start ?? "";
    const league = sel(prop(page, "리그"));
    const prediction = sel(prop(page, "예측"));
    const homeWin = num(prop(page, "통계모델_홈승"));
    const draw = num(prop(page, "통계모델_무승부"));
    const awayWin = num(prop(page, "통계모델_원정승"));
    const modelMatch = sel(prop(page, "모델일치"));
    const aiAdjust = txt(prop(page, "AI조정"));
    const actualResult = txt(prop(page, "실제결과"));
    const hitStatus = sel(prop(page, "적중여부"));

    // Determine top probability
    const probs = [
      { label: "홈승", val: homeWin },
      { label: "무승부", val: draw },
      { label: "원정승", val: awayWin },
    ].filter(x => x.val !== null);
    const topProb = probs.length > 0 ? Math.max(...probs.map(x => x.val)) : null;

    records.push({
      match, date, league, prediction,
      homeWin, draw, awayWin,
      modelMatch, aiAdjust, actualResult, hitStatus, topProb,
    });

    console.log(`\n📅 ${date} | 🏆 ${league}`);
    console.log(`⚽ ${match}`);
    console.log(`   예측: ${prediction}`);
    if (homeWin !== null || draw !== null || awayWin !== null) {
      console.log(`   통계모델: 홈승 ${homeWin ?? "-"}% / 무승부 ${draw ?? "-"}% / 원정승 ${awayWin ?? "-"}%`);
    }
    if (modelMatch) console.log(`   모델일치도: ${modelMatch}`);
    if (aiAdjust) console.log(`   AI조정: ${aiAdjust}`);
    console.log(`   실제결과: ${actualResult || "(미정)"}`);
    console.log(`   적중여부: ${hitStatus || "(미판정)"}`);
    console.log("-".repeat(80));
  }

  // 4. Summary
  const judged = records.filter(r => r.hitStatus === "적중" || r.hitStatus === "미적중");
  const correct = judged.filter(r => r.hitStatus === "적중");
  const wrong = judged.filter(r => r.hitStatus === "미적중");
  const pending = records.filter(r => r.hitStatus !== "적중" && r.hitStatus !== "미적중");

  console.log("\n" + "=".repeat(80));
  console.log("📊 [요약]");
  console.log(`   총 ⭐⭐⭐ 경기: ${records.length}건`);
  console.log(`   판정 완료: ${judged.length}건`);
  console.log(`   ✅ 적중: ${correct.length}건`);
  console.log(`   ❌ 미적중: ${wrong.length}건`);
  console.log(`   ⏳ 미판정: ${pending.length}건`);
  if (judged.length > 0) {
    const rate = ((correct.length / judged.length) * 100).toFixed(1);
    console.log(`   🎯 적중률: ${rate}% (${correct.length}/${judged.length})`);
  }

  // 5. Pattern comparison
  if (correct.length > 0 || wrong.length > 0) {
    console.log("\n" + "=".repeat(80));
    console.log("🔍 [적중 vs 미적중 패턴 비교]\n");

    // Average top probability
    const avgTop = (arr) => {
      const vals = arr.filter(r => r.topProb !== null).map(r => r.topProb);
      return vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "N/A";
    };
    console.log("▸ 평균 1위 확률:");
    console.log(`   적중 그룹: ${avgTop(correct)}%`);
    console.log(`   미적중 그룹: ${avgTop(wrong)}%`);

    // Model agreement distribution
    console.log("\n▸ 모델일치도 분포:");
    const modelDist = (arr, label) => {
      const counts = {};
      arr.forEach(r => {
        const k = r.modelMatch || "(없음)";
        counts[k] = (counts[k] || 0) + 1;
      });
      console.log(`   ${label}:`);
      for (const [k, v] of Object.entries(counts).sort()) {
        console.log(`     ${k}: ${v}건 (${((v / arr.length) * 100).toFixed(1)}%)`);
      }
    };
    modelDist(correct, "적중 그룹");
    modelDist(wrong, "미적중 그룹");

    // League distribution
    console.log("\n▸ 리그 분포:");
    const leagueDist = (arr, label) => {
      const counts = {};
      arr.forEach(r => {
        const k = r.league || "(없음)";
        counts[k] = (counts[k] || 0) + 1;
      });
      console.log(`   ${label}:`);
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      for (const [k, v] of sorted) {
        console.log(`     ${k}: ${v}건`);
      }
    };
    leagueDist(correct, "적중 그룹");
    leagueDist(wrong, "미적중 그룹");
  }

  console.log("\n" + "=".repeat(80));
  console.log("분석 완료.");
}

main().catch(e => { console.error("Error:", e.message); process.exit(1); });
