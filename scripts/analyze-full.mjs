import { config } from "dotenv";
import { Client } from "@notionhq/client";

config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = "c451c2a04e6b4a7d85d0b8771e278d05";

// ── Notion fetch (pagination) ──

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

// ── Property readers ──

function richText(page, name) {
  const rt = page.properties[name]?.rich_text;
  if (!rt || rt.length === 0) return "";
  return rt.map(t => t.plain_text).join("");
}

function title(page, name) {
  const t = page.properties[name]?.title;
  if (!t || t.length === 0) return "";
  return t.map(t => t.plain_text).join("");
}

function select(page, name) {
  return page.properties[name]?.select?.name ?? "";
}

function date(page, name) {
  return page.properties[name]?.date?.start ?? "";
}

/** Parse "45.2%" → 45.2, returns null if empty/unparseable */
function parsePercent(str) {
  if (!str) return null;
  const n = parseFloat(str.replace("%", "").trim());
  return isNaN(n) ? null : n;
}

// ── Parse a page into a record ──

function parsePage(page) {
  const match = title(page, "경기");
  const dt = date(page, "날짜");
  const league = select(page, "리그");
  const prediction = select(page, "예측");
  const confidence = select(page, "확신도");
  const hitStatus = select(page, "적중여부");
  const actualResult = richText(page, "실제결과");
  const modelAgreement = richText(page, "모델일치");

  const homeWinStr = richText(page, "통계모델_홈승");
  const drawStr = richText(page, "통계모델_무승부");
  const awayWinStr = richText(page, "통계모델_원정승");

  const homeWin = parsePercent(homeWinStr);
  const draw = parsePercent(drawStr);
  const awayWin = parsePercent(awayWinStr);

  const hasStats = homeWinStr.trim() !== "";

  // 1위 확률
  const probs = [homeWin, draw, awayWin].filter(v => v !== null);
  const topProb = probs.length > 0 ? Math.max(...probs) : null;

  // 확신도 → 별 수
  const stars = confidence ? [...confidence].filter(c => c === "⭐").length : 0;

  return {
    match, date: dt, league, prediction, confidence, stars,
    hitStatus, actualResult, modelAgreement,
    homeWin, draw, awayWin, homeWinStr, drawStr, awayWinStr,
    hasStats, topProb,
  };
}

// ── Helpers ──

function hitRate(arr) {
  const judged = arr.filter(r => r.hitStatus === "적중" || r.hitStatus === "미적중");
  const correct = judged.filter(r => r.hitStatus === "적중").length;
  return { correct, miss: judged.length - correct, pending: arr.length - judged.length, total: judged.length, rate: judged.length > 0 ? (correct / judged.length * 100) : null };
}

function fmtRate(h) {
  return h.rate !== null ? `${h.rate.toFixed(1)}%` : "N/A";
}

function avgTopProb(arr) {
  const vals = arr.filter(r => r.topProb !== null).map(r => r.topProb);
  return vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "N/A";
}

function countBy(arr, key) {
  const m = {};
  arr.forEach(r => { const k = r[key] || "(없음)"; m[k] = (m[k] || 0) + 1; });
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

function padR(s, n) { return String(s).padEnd(n); }
function padL(s, n) { return String(s).padStart(n); }

// ── Main ──

async function main() {
  console.log("⏳ Notion 예측 DB에서 데이터를 가져오는 중...\n");
  const pages = await fetchAll();
  const records = pages.map(parsePage);
  console.log(`총 ${records.length}건 fetch 완료.\n`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. 통계모델 데이터 유무 체크
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const noStats = records.filter(r => !r.hasStats);
  console.log(`📋 통계모델_홈승 필드 비어있는 건: ${noStats.length}건 / ${records.length}건`);
  if (noStats.length > 0) {
    console.log("   (해당 경기는 통계 관련 분석에서 제외됩니다)");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. 전체 요약 테이블
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const starLabels = ["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"];
  const byStars = {};
  for (const label of starLabels) {
    const cnt = [...label].filter(c => c === "⭐").length;
    byStars[cnt] = records.filter(r => r.stars === cnt);
  }

  console.log("\n" + "━".repeat(80));
  console.log("📊 전체 요약 테이블");
  console.log("━".repeat(80));
  console.log(`  ${padR("확신도", 14)} ${padL("총건수", 6)} ${padL("적중", 6)} ${padL("미적중", 6)} ${padL("미판정", 6)} ${padL("적중률", 8)}`);
  console.log("  " + "-".repeat(52));

  for (let s = 1; s <= 5; s++) {
    const arr = byStars[s] || [];
    const h = hitRate(arr);
    console.log(`  ${padR(starLabels[s - 1], 14)} ${padL(arr.length, 6)} ${padL(h.correct, 6)} ${padL(h.miss, 6)} ${padL(h.pending, 6)} ${padL(fmtRate(h), 8)}`);
  }

  const totalH = hitRate(records);
  console.log("  " + "-".repeat(52));
  console.log(`  ${padR("전체", 14)} ${padL(records.length, 6)} ${padL(totalH.correct, 6)} ${padL(totalH.miss, 6)} ${padL(totalH.pending, 6)} ${padL(fmtRate(totalH), 8)}`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. 확신도별 상세 분석
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  for (let s = 1; s <= 5; s++) {
    const arr = byStars[s] || [];
    if (arr.length === 0) continue;

    const label = starLabels[s - 1];
    console.log("\n" + "━".repeat(80));
    console.log(`🔍 확신도 ${label} 상세 분석 (${arr.length}건)`);
    console.log("━".repeat(80));

    const correct = arr.filter(r => r.hitStatus === "적중");
    const wrong = arr.filter(r => r.hitStatus === "미적중");

    // 4a. 적중 vs 미적중 비교
    if (correct.length > 0 || wrong.length > 0) {
      console.log("\n  ▸ 평균 1위 확률:");
      console.log(`    적중 그룹 (${correct.length}건): ${avgTopProb(correct)}%`);
      console.log(`    미적중 그룹 (${wrong.length}건): ${avgTopProb(wrong)}%`);

      console.log("\n  ▸ 모델일치도 분포:");
      for (const [group, label2] of [[correct, "적중"], [wrong, "미적중"]]) {
        if (group.length === 0) continue;
        const dist = countBy(group, "modelAgreement");
        console.log(`    ${label2} 그룹: ${dist.map(([k, v]) => `${k || "(없음)"}=${v}건`).join(", ")}`);
      }

      console.log("\n  ▸ 리그 분포:");
      for (const [group, label2] of [[correct, "적중"], [wrong, "미적중"]]) {
        if (group.length === 0) continue;
        const dist = countBy(group, "league");
        console.log(`    ${label2} 그룹: ${dist.map(([k, v]) => `${k}=${v}건`).join(", ")}`);
      }
    }

    // 4b. 경기 리스트
    console.log(`\n  ▸ 경기 리스트:`);
    for (const r of arr) {
      const stats = r.hasStats
        ? `홈${r.homeWin ?? "-"}/무${r.draw ?? "-"}/원${r.awayWin ?? "-"} 일치:${r.modelAgreement || "-"}`
        : "(통계없음)";
      const icon = r.hitStatus === "적중" ? "✅" : r.hitStatus === "미적중" ? "❌" : "⏳";
      console.log(`    ${icon} [${r.date}] ${r.league} | ${r.match}`);
      console.log(`       예측:${r.prediction} | ${stats} | 결과:${r.actualResult || "-"}`);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. 크로스 분석
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const judged = records.filter(r => r.hitStatus === "적중" || r.hitStatus === "미적중");

  console.log("\n" + "━".repeat(80));
  console.log("📈 크로스 분석");
  console.log("━".repeat(80));

  // 5a. 리그별 적중률
  const MAJOR5 = new Set(["프리미어리그", "라리가", "세리에A", "분데스리가", "리그1"]);
  const leagueGroups = {};
  judged.forEach(r => {
    const k = r.league || "(없음)";
    if (!leagueGroups[k]) leagueGroups[k] = [];
    leagueGroups[k].push(r);
  });

  console.log("\n  ▸ 리그별 적중률:");
  const major5Entries = [];
  const cupEntries = [];

  for (const [league, arr] of Object.entries(leagueGroups).sort((a, b) => b[1].length - a[1].length)) {
    const h = hitRate(arr);
    const line = `    ${padR(league, 16)} ${padL(h.correct, 3)}/${padL(h.total, 3)} = ${fmtRate(h)}`;
    if (MAJOR5.has(league)) major5Entries.push(line);
    else cupEntries.push(line);
  }

  if (major5Entries.length > 0) {
    console.log("    [5대 리그]");
    major5Entries.forEach(l => console.log(l));
    const major5All = judged.filter(r => MAJOR5.has(r.league));
    const m5h = hitRate(major5All);
    console.log(`    ${"─".repeat(36)}`);
    console.log(`    ${padR("5대리그 소계", 16)} ${padL(m5h.correct, 3)}/${padL(m5h.total, 3)} = ${fmtRate(m5h)}`);
  }
  if (cupEntries.length > 0) {
    console.log("    [컵/유럽 대회]");
    cupEntries.forEach(l => console.log(l));
    const cupAll = judged.filter(r => !MAJOR5.has(r.league));
    const ch = hitRate(cupAll);
    console.log(`    ${"─".repeat(36)}`);
    console.log(`    ${padR("컵대회 소계", 16)} ${padL(ch.correct, 3)}/${padL(ch.total, 3)} = ${fmtRate(ch)}`);
  }

  // 5b. 모델일치도별 적중률
  console.log("\n  ▸ 모델일치도별 적중률:");
  const modelGroups = {};
  judged.forEach(r => {
    const k = r.modelAgreement || "(없음)";
    if (!modelGroups[k]) modelGroups[k] = [];
    modelGroups[k].push(r);
  });
  for (const [ma, arr] of Object.entries(modelGroups).sort()) {
    const h = hitRate(arr);
    console.log(`    ${padR(ma, 10)} ${padL(h.correct, 3)}/${padL(h.total, 3)} = ${fmtRate(h)}`);
  }

  // 5c. 1위 확률 구간별 적중률
  console.log("\n  ▸ 1위 확률 구간별 적중률:");
  const probBuckets = { "<50%": [], "50-60%": [], "60-70%": [], "70%+": [] };
  judged.forEach(r => {
    if (r.topProb === null) return;
    if (r.topProb < 50) probBuckets["<50%"].push(r);
    else if (r.topProb < 60) probBuckets["50-60%"].push(r);
    else if (r.topProb < 70) probBuckets["60-70%"].push(r);
    else probBuckets["70%+"].push(r);
  });
  for (const [bucket, arr] of Object.entries(probBuckets)) {
    if (arr.length === 0) { console.log(`    ${padR(bucket, 10)} (데이터 없음)`); continue; }
    const h = hitRate(arr);
    console.log(`    ${padR(bucket, 10)} ${padL(h.correct, 3)}/${padL(h.total, 3)} = ${fmtRate(h)}`);
  }
  const noProb = judged.filter(r => r.topProb === null);
  if (noProb.length > 0) {
    const h = hitRate(noProb);
    console.log(`    ${padR("(확률없음)", 10)} ${padL(h.correct, 3)}/${padL(h.total, 3)} = ${fmtRate(h)}`);
  }

  // 5d. 날짜별 추이
  console.log("\n  ▸ 날짜별 적중률 추이:");
  const dateGroups = {};
  judged.forEach(r => {
    if (!r.date) return;
    if (!dateGroups[r.date]) dateGroups[r.date] = [];
    dateGroups[r.date].push(r);
  });
  const sortedDates = Object.keys(dateGroups).sort();
  let cumCorrect = 0, cumTotal = 0;
  for (const d of sortedDates) {
    const arr = dateGroups[d];
    const h = hitRate(arr);
    cumCorrect += h.correct;
    cumTotal += h.total;
    const cumRate = cumTotal > 0 ? (cumCorrect / cumTotal * 100).toFixed(1) : "N/A";
    console.log(`    ${d}  ${padL(h.correct, 2)}/${padL(h.total, 2)} = ${padL(fmtRate(h), 6)}  (누적: ${cumCorrect}/${cumTotal} = ${cumRate}%)`);
  }

  console.log("\n" + "━".repeat(80));
  console.log("분석 완료.");
}

main().catch(e => { console.error("Error:", e.message); process.exit(1); });
