"use client";
import { useState, useEffect } from "react";

const sampleReport = {
  league: "EPL", home: "Wolves", away: "Liverpool", date: "2026-03-03 20:15",
  summary: "Liverpool 6명 결장에도 배당 시장은 원정승 67% 반영, API 예측과 22%p 괴리 발생",
  analysis: [
    "양팀 모두 부상자 다수. Wolves 3명 출전 불투명, Liverpool 6명 확정 결장. 배당 시장은 Liverpool 원정승을 67.1% 확률로 평가하나 API 데이터는 45%로 추정.",
    "무승부 가능성이 시장 대비 22%p 저평가 중. Liverpool의 대규모 결장이 시장에서 충분히 반영되지 않은 것으로 분석."
  ],
  odds: { home: "6.00", draw: "4.35", away: "1.49" },
  oddsProb: { home: "16.7%", draw: "23.0%", away: "67.1%" },
  confidence: 1,
  keyPoint: "Liverpool 대규모 결장 변수가 배당에 미반영",
  valueMarket: "무승부 4.35 (내재 23% vs 추정 45%)"
};

const features = [
  { icon: "📊", title: "멀티레이어 데이터 분석", desc: "폼, 상대전적, 부상, 배당, 라인업을 종합 분석" },
  { icon: "🤖", title: "AI 심층 분석", desc: "Claude AI가 데이터 기반 리포트를 자동 생성" },
  { icon: "💰", title: "배당 가치 분석", desc: "시장 내재확률과 데이터 추정의 괴리를 탐지" },
  { icon: "💬", title: "카톡으로 바로 수신", desc: "리그별 분석이 카카오톡으로 바로 도착" }
];

const todayMatches = [
  { league: "EPL", home: "Wolves", away: "Liverpool", time: "20:15", confidence: 1 },
  { league: "EPL", home: "Everton", away: "Man City", time: "20:15", confidence: 2 },
  { league: "UCL", home: "Barcelona", away: "PSG", time: "21:00", confidence: 3 },
  { league: "La Liga", home: "Atletico", away: "Real Betis", time: "19:00", confidence: 2 },
  { league: "FA Cup", home: "Arsenal", away: "Chelsea", time: "17:30", confidence: 2 },
  { league: "K League", home: "전북", away: "울산", time: "14:00", confidence: 2 }
];

const kakaoPostSample = `⚽ MATCHLAB — EPL 경기 분석
━━━━━━━━━━━━━━━━━━

🏟 Wolves vs Liverpool
📅 2026-03-03 (월) 20:15 KST

📊 한줄 요약
Liverpool 6명 결장에도 배당 시장은
원정승 67% 반영, API 예측과 22%p 괴리

🔍 분석
▸ Wolves 3명 출전 불투명
▸ Liverpool 6명 확정 결장
▸ 배당: 홈 6.00 | 무 4.35 | 원 1.49
▸ 무승부 가능성 시장 대비 22%p 저평가

💰 가치 마켓
무승부 4.35배 (내재 23% vs 추정 45%)

🎯 확신도: ⭐ (배당 레이어만 유효)

━━━━━━━━━━━━━━━━━━
⚠️ 데이터 기반 정보이며 결과를 보장하지 않습니다`;

const leaguePosts = [
  { league: "EPL", emoji: "🏴", color: "#00ff88", matches: "Wolves vs Liverpool 외 1경기" },
  { league: "UCL", emoji: "🏆", color: "#00ddff", matches: "Barcelona vs PSG" },
  { league: "La Liga", emoji: "🇪🇸", color: "#ffaa00", matches: "Atletico vs Real Betis" },
  { league: "K League", emoji: "🇰🇷", color: "#ff6b6b", matches: "전북 vs 울산" },
];

const supportedLeagues = [
  { group: "5대 리그", color: "#00ff88", items: ["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1"] },
  { group: "컵대회", color: "#00ddff", items: ["UCL", "UEL", "Conference League", "FA Cup", "Copa del Rey", "Coppa Italia", "DFB-Pokal", "Coupe de France"] },
  { group: "기타", color: "#ffaa00", items: ["K League", "J League", "MLS", "Eredivisie", "Liga Portugal", "Super Lig", "Belgian Pro"] },
];

function MatchLabIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none">
      <circle cx="80" cy="80" r="62" stroke="#F2F0ED" strokeWidth="2.5" fill="none" />
      <path d="M80 42 L100 56 L93 78 L67 78 L60 56 Z" stroke="#F2F0ED" strokeWidth="1.5" fill="none" />
      <line x1="80" y1="42" x2="80" y2="18" stroke="#F2F0ED" strokeWidth="1" opacity="0.12" />
      <line x1="100" y1="56" x2="122" y2="42" stroke="#F2F0ED" strokeWidth="1" opacity="0.12" />
      <line x1="60" y1="56" x2="38" y2="42" stroke="#F2F0ED" strokeWidth="1" opacity="0.12" />
      <line x1="93" y1="78" x2="112" y2="96" stroke="#F2F0ED" strokeWidth="1" opacity="0.12" />
      <line x1="67" y1="78" x2="48" y2="96" stroke="#F2F0ED" strokeWidth="1" opacity="0.12" />
      <path d="M48 96 L60 116 L100 116 L112 96" stroke="#F2F0ED" strokeWidth="1" fill="none" opacity="0.12" />
      <polyline points="28,115 48,98 62,104 80,82 100,88 120,65 142,52"
        stroke="#00E676" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="80" cy="82" r="4" fill="#00E676" />
      <circle cx="120" cy="65" r="4" fill="#00E676" />
      <circle cx="142" cy="52" r="4.5" fill="#00E676" />
    </svg>
  );
}

function Stars({ count }) {
  return <span style={{ letterSpacing: 2 }}>{"⭐".repeat(count)}</span>;
}

function Anim({ children, delay = 0 }) {
  const [v, setV] = useState(false);
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t); }, [delay]);
  return (<div style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)" }}>{children}</div>);
}

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');*{margin:0;padding:0;box-sizing:border-box}::selection{background:#00ff8820;color:#00ff88}@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}@keyframes glow{0%,100%{box-shadow:0 0 20px #00ff8810,inset 0 1px 0 #00ff8815}50%{box-shadow:0 0 40px #00ff8820,inset 0 1px 0 #00ff8825}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}.mr:hover{background:#00ff8808!important;cursor:pointer}.cb:hover{transform:translateY(-2px)!important;box-shadow:0 8px 32px #00ff8840!important}.fc:hover{border-color:#00ff8860!important;transform:translateY(-4px)!important}.kp:hover{border-color:#FEE50060!important;transform:scale(1.02)!important}`;

export default function Home() {
  const [active, setActive] = useState(0);
  const G = "#00ff88", F = "'Outfit',sans-serif";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e8e8e8", fontFamily: "'Courier New',monospace", overflowX: "hidden" }}>
      <style>{CSS}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,#00ff8803 2px,#00ff8803 4px)", pointerEvents: "none", zIndex: 100 }} />
      <div style={{ position: "fixed", top: -200, right: -200, width: 600, height: 600, background: "radial-gradient(circle,#00ff8808 0%,transparent 70%)", pointerEvents: "none" }} />

      {/* NAV */}
      <nav style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1a1a1a", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 50, background: "#0a0a0aee" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <MatchLabIcon size={28} />
          <span style={{ fontFamily: F, fontSize: 22, fontWeight: 800, letterSpacing: 3, background: "linear-gradient(135deg,#00ff88,#00cc66)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MATCHLAB</span>
        </div>
        <a href="http://pf.kakao.com/_sThZX" target="_blank" rel="noopener noreferrer" className="cb" style={{ background: "#FEE500", color: "#1a1a1a", padding: "10px 24px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", letterSpacing: 1, fontFamily: F, transition: "all 0.3s", display: "flex", alignItems: "center", gap: 6 }}>
          💬 카톡 채널 추가
        </a>
      </nav>

      {/* HERO */}
      <section style={{ padding: "100px 40px 60px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <Anim delay={100}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: G, marginBottom: 24, textTransform: "uppercase" }}>AI Football Match Analysis</div>
        </Anim>
        <Anim delay={200}>
          <div style={{ display: "inline-flex", gap: 6, marginBottom: 20, flexWrap: "wrap", justifyContent: "center" }}>
            {["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "UCL", "UEL", "FA Cup", "K League"].map((l, i) => (
              <span key={i} style={{ fontSize: 10, color: i < 5 ? G : i < 8 ? "#00ddff" : "#ffaa00", letterSpacing: 1, background: i < 5 ? "#00ff8810" : i < 8 ? "#00ddff10" : "#ffaa0010", padding: "3px 10px", borderRadius: 20, border: `1px solid ${i < 5 ? "#00ff8820" : i < 8 ? "#00ddff20" : "#ffaa0020"}` }}>{l}</span>
            ))}
            <span style={{ fontSize: 10, color: "#555", letterSpacing: 1, padding: "3px 10px" }}>+11개</span>
          </div>
        </Anim>
        <Anim delay={300}>
          <h1 style={{ fontFamily: F, fontSize: "clamp(32px,6vw,60px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
            AI가 잡아내는<br />
            <span style={{ background: "linear-gradient(135deg,#00ff88,#00ddff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>축구 경기 분석</span>
          </h1>
        </Anim>
        <Anim delay={500}>
          <p style={{ fontSize: 16, color: "#888", lineHeight: 1.8, maxWidth: 520, margin: "0 auto 20px", fontFamily: F, fontWeight: 300 }}>
            20개 리그·컵대회 경기를 AI가 데이터로 분석하고<br />
            <span style={{ color: "#FEE500", fontWeight: 600 }}>카카오톡으로 바로</span> 보내드립니다
          </p>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 48, flexWrap: "wrap" }}>
            {["📊 배당 괴리 탐지", "🏅 부상/라인업 반영", "🤖 AI 심층 리포트", "💬 리그별 카톡 수신"].map((t, i) => (
              <span key={i} style={{ fontSize: 12, color: "#666", fontFamily: F }}>{t}</span>
            ))}
          </div>
        </Anim>
        <Anim delay={700}>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="http://pf.kakao.com/_sThZX" target="_blank" rel="noopener noreferrer" className="cb" style={{ background: "#FEE500", color: "#1a1a1a", padding: "16px 40px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", letterSpacing: 1, fontFamily: F, transition: "all 0.3s", boxShadow: "0 4px 24px #FEE50030", display: "flex", alignItems: "center", gap: 8 }}>
              💬 카카오톡으로 무료 구독
            </a>
            <a href="#sample" style={{ border: "1px solid #333", color: "#aaa", padding: "16px 36px", borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: "none", letterSpacing: 1, fontFamily: F }}>샘플 리포트 ↓</a>
          </div>
        </Anim>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "60px 40px", maxWidth: 900, margin: "0 auto" }}>
        <Anim delay={200}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#555", marginBottom: 16, textTransform: "uppercase" }}>How It Works</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
            {[
              { icon: "📡", label: "데이터 수집", sub: "20개 리그" },
              { icon: "→", label: "", sub: "" },
              { icon: "🤖", label: "AI 분석", sub: "Claude AI" },
              { icon: "→", label: "", sub: "" },
              { icon: "💬", label: "카톡 발송", sub: "리그별 포스트" },
            ].map((s, i) => (
              s.icon === "→" ? (
                <span key={i} style={{ color: "#333", fontSize: 20, fontFamily: F }}>→</span>
              ) : (
                <div key={i} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 12, padding: "18px 24px", textAlign: "center", minWidth: 120 }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 13, fontFamily: F, fontWeight: 600, color: "#ddd" }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "#555", fontFamily: F }}>{s.sub}</div>
                </div>
              )
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
            {features.map((f, i) => (
              <div key={i} className="fc" style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 10, padding: "24px 20px", transition: "all 0.3s" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, fontFamily: F, color: "#ddd" }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6, fontFamily: F }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </Anim>
      </section>

      {/* 리그별 카톡 포스트 미리보기 */}
      <section style={{ padding: "60px 40px", maxWidth: 900, margin: "0 auto" }}>
        <Anim delay={200}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#555", marginBottom: 6, textTransform: "uppercase" }}>KakaoTalk Posts</div>
          <div style={{ fontFamily: F, fontSize: 22, fontWeight: 700, marginBottom: 6 }}>리그별로 카톡이 옵니다</div>
          <p style={{ fontSize: 13, color: "#666", fontFamily: F, marginBottom: 24 }}>경기 있는 날, 해당 리그 분석이 카카오톡 채널 포스트로 도착합니다</p>

          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 4 }}>오늘 발송되는 포스트</div>
              {leaguePosts.map((p, i) => (
                <div key={i} className="kp" style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 10, padding: "14px 16px", cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14 }}>{p.emoji}</span>
                    <span style={{ fontSize: 13, fontFamily: F, fontWeight: 700, color: p.color }}>{p.league}</span>
                    <span style={{ fontSize: 9, color: "#555", fontFamily: F }}>포스트</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#888", fontFamily: F }}>{p.matches}</div>
                </div>
              ))}
              <div style={{ fontSize: 10, color: "#444", fontFamily: F, textAlign: "center", marginTop: 4 }}>경기 있는 리그만 발송됩니다</div>
            </div>

            <div style={{ background: "#B2C7D9", borderRadius: 16, padding: "20px 16px", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}><MatchLabIcon size={18} /></div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#333", fontFamily: F }}>MATCHLAB</span>
              </div>
              <div style={{ background: "#fff", borderRadius: 12, padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", maxHeight: 360, overflow: "hidden", position: "relative" }}>
                <pre style={{ fontFamily: "'Courier New',monospace", fontSize: 10.5, color: "#333", lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
                  {kakaoPostSample}
                </pre>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(transparent, #fff)" }} />
              </div>
              <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: "#5a6a7a" }}>실제 카카오톡에서 수신되는 형태</div>
            </div>
          </div>
        </Anim>
      </section>

      {/* TODAY'S ANALYSIS */}
      <section style={{ padding: "60px 40px", maxWidth: 900, margin: "0 auto" }}>
        <Anim delay={200}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#555", marginBottom: 16, textTransform: "uppercase" }}>{"Today's Analysis"}</div>
          <div style={{ border: "1px solid #1a1a1a", borderRadius: 12, overflow: "hidden", background: "#0f0f0f" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#666", fontFamily: F }}>{`오늘의 경기 — ${todayMatches.length}경기 분석 완료`}</span>
              <span style={{ fontSize: 11, color: G, letterSpacing: 2 }}>LIVE</span>
            </div>
            {todayMatches.map((m, i) => (
              <div key={i} className="mr" onClick={() => setActive(i)} style={{ padding: "14px 24px", display: "grid", gridTemplateColumns: "70px 1fr auto", alignItems: "center", gap: 16, borderBottom: i < todayMatches.length - 1 ? "1px solid #141414" : "none", transition: "background 0.2s", background: active === i ? "#00ff8808" : "transparent" }}>
                <span style={{ fontSize: 10, color: G, letterSpacing: 1, background: "#00ff8810", padding: "4px 8px", borderRadius: 4, textAlign: "center" }}>{m.league}</span>
                <div style={{ fontFamily: F }}><span style={{ fontSize: 14, fontWeight: 500 }}>{m.home}</span><span style={{ fontSize: 12, color: "#444", margin: "0 10px" }}>vs</span><span style={{ fontSize: 14, fontWeight: 500 }}>{m.away}</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}><Stars count={m.confidence} /><span style={{ fontSize: 11, color: "#555" }}>{m.time}</span></div>
              </div>
            ))}
          </div>
        </Anim>
      </section>

      {/* SAMPLE REPORT */}
      <section id="sample" style={{ padding: "60px 40px", maxWidth: 900, margin: "0 auto" }}>
        <Anim delay={200}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#555", marginBottom: 16, textTransform: "uppercase" }}>Sample Report</div>
          <div style={{ border: "1px solid #1a1a1a", borderRadius: 12, overflow: "hidden", background: "#0d0d0d", animation: "glow 4s infinite" }}>
            <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid #1a1a1a", background: "linear-gradient(135deg,#0f0f0f,#111)" }}>
              <div style={{ fontSize: 18, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><MatchLabIcon size={22} /><span>MATCHLAB</span></div>
              <div style={{ fontFamily: F, fontSize: 20, fontWeight: 700 }}>{`${sampleReport.league} | ${sampleReport.home} vs ${sampleReport.away}`}</div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>{sampleReport.date} KST</div>
            </div>
            <div style={{ padding: "24px 28px" }}>
              <div style={{ marginBottom: 24 }}><div style={{ fontSize: 12, color: G, marginBottom: 8, letterSpacing: 2 }}>📊 한줄 요약</div><div style={{ fontSize: 14, lineHeight: 1.7, color: "#ccc", fontFamily: F, borderLeft: "2px solid #00ff8840", paddingLeft: 16 }}>{sampleReport.summary}</div></div>
              <div style={{ marginBottom: 24 }}><div style={{ fontSize: 12, color: G, marginBottom: 8, letterSpacing: 2 }}>🔍 분석</div>{sampleReport.analysis.map((p, i) => (<p key={i} style={{ fontSize: 13, lineHeight: 1.8, color: "#999", fontFamily: F, marginBottom: 8 }}>{p}</p>))}</div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: G, marginBottom: 12, letterSpacing: 2 }}>💰 배당 분석</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
                  {[{ label: "홈", odds: sampleReport.odds.home, prob: sampleReport.oddsProb.home }, { label: "무", odds: sampleReport.odds.draw, prob: sampleReport.oddsProb.draw }, { label: "원", odds: sampleReport.odds.away, prob: sampleReport.oddsProb.away }].map((o, i) => (
                    <div key={i} style={{ background: "#141414", borderRadius: 8, padding: "12px 16px", textAlign: "center", border: "1px solid #1e1e1e" }}>
                      <div style={{ fontSize: 10, color: "#666", marginBottom: 4, letterSpacing: 1 }}>{o.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#e8e8e8", fontFamily: F }}>{o.odds}</div>
                      <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{o.prob}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: G, fontWeight: 500, fontFamily: F, background: "#00ff8808", padding: "10px 16px", borderRadius: 6, border: "1px solid #00ff8815" }}>무승부 4.35배에 22%p 저평가 → 가치 주목</div>
              </div>
              <div style={{ background: "#111", borderRadius: 8, padding: "20px 24px", border: "1px solid #1e1e1e" }}>
                <div style={{ fontSize: 12, color: G, marginBottom: 12, letterSpacing: 2 }}>🎯 MATCHLAB 결론</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 13, fontFamily: F }}><span style={{ color: "#666" }}>확신도: </span><Stars count={1} /><span style={{ color: "#777", marginLeft: 8, fontSize: 12 }}>배당 레이어만 유효</span></div>
                  <div style={{ fontSize: 13, fontFamily: F }}><span style={{ color: "#666" }}>주목: </span><span style={{ color: "#ccc" }}>{sampleReport.keyPoint}</span></div>
                  <div style={{ fontSize: 13, fontFamily: F }}><span style={{ color: "#666" }}>가치: </span><span style={{ color: G }}>{sampleReport.valueMarket}</span></div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#444", marginTop: 16, textAlign: "center" }}>⚠️ 데이터 기반 정보이며, 결과를 보장하지 않습니다.</div>
            </div>
          </div>
        </Anim>
      </section>

      {/* CONFIDENCE RATING */}
      <section style={{ padding: "60px 40px", maxWidth: 900, margin: "0 auto" }}>
        <Anim delay={200}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#555", marginBottom: 16, textTransform: "uppercase" }}>Confidence Rating</div>
          <div style={{ border: "1px solid #1a1a1a", borderRadius: 12, overflow: "hidden", background: "#0f0f0f" }}>
            {[{ stars: 3, label: "High", desc: "대부분 데이터 레이어가 같은 방향", color: "#00ff88" }, { stars: 2, label: "Medium", desc: "3개 레이어 일치", color: "#ffaa00" }, { stars: 1, label: "Low", desc: "2개 이하, 변수 많은 경기", color: "#ff4444" }].map((r, i) => (
              <div key={i} style={{ padding: "18px 24px", display: "grid", gridTemplateColumns: "100px 1fr", alignItems: "center", gap: 16, borderBottom: i < 2 ? "1px solid #141414" : "none" }}>
                <Stars count={r.stars} />
                <div><div style={{ fontSize: 14, fontWeight: 600, color: r.color, fontFamily: F, marginBottom: 2 }}>{r.label}</div><div style={{ fontSize: 12, color: "#666", fontFamily: F }}>{r.desc}</div></div>
              </div>
            ))}
          </div>
        </Anim>
      </section>

      {/* SUPPORTED LEAGUES */}
      <section style={{ padding: "60px 40px", maxWidth: 900, margin: "0 auto" }}>
        <Anim delay={200}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#555", marginBottom: 16, textTransform: "uppercase" }}>Supported Leagues</div>
          <div style={{ fontFamily: F, fontSize: 18, fontWeight: 700, marginBottom: 20 }}>20개 리그 · 컵대회 분석</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {supportedLeagues.map((g, gi) => (
              <div key={gi}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: g.color, marginBottom: 8, fontFamily: F }}>{g.group}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {g.items.map((item, i) => (
                    <span key={i} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8, background: `${g.color}10`, border: `1px solid ${g.color}25`, color: g.color, fontFamily: F }}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Anim>
      </section>

      {/* CTA */}
      <section id="subscribe" style={{ padding: "80px 40px 100px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <Anim delay={200}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#FEE500", marginBottom: 20, textTransform: "uppercase" }}>Subscribe Free</div>
          <h2 style={{ fontFamily: F, fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, marginBottom: 12 }}>
            카카오톡으로<br />
            <span style={{ color: "#FEE500" }}>바로 받아보기</span>
          </h2>
          <p style={{ fontSize: 15, color: "#666", marginBottom: 16, fontFamily: F, lineHeight: 1.8 }}>
            채널 추가만 하면 리그별 분석이 카톡으로 바로 도착합니다<br />
            회원가입 필요 없음 · 완전 무료 · 언제든 구독 취소
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            {["매일 경기 전 발송", "리그별 분리 포스트", "AI 데이터 분석", "배당 가치 탐지"].map((t, i) => (
              <span key={i} style={{ fontSize: 11, color: "#888", fontFamily: F, background: "#111", padding: "6px 14px", borderRadius: 20, border: "1px solid #1a1a1a" }}>✓ {t}</span>
            ))}
          </div>

          <div style={{ marginTop: 8 }}>
            <a href="http://pf.kakao.com/_sThZX" target="_blank" rel="noopener noreferrer" className="cb" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#FEE500", color: "#1a1a1a", border: "none", padding: "18px 48px", borderRadius: 12, fontSize: 17, fontWeight: 800, fontFamily: F, cursor: "pointer", letterSpacing: 1, transition: "all 0.3s", boxShadow: "0 4px 24px #FEE50030", textDecoration: "none" }}>
              💬 카카오톡 채널 추가하기
            </a>
          </div>
          <div style={{ fontSize: 11, color: "#444", marginTop: 20, lineHeight: 1.8 }}>
            광고 없음 · 데이터 수집 없음 · 순수 분석 서비스
          </div>
        </Anim>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "24px 40px", borderTop: "1px solid #141414", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 11, color: "#333", letterSpacing: 2 }}>© 2026 MATCHLAB</div>
        <div style={{ fontSize: 10, color: "#333", letterSpacing: 1 }}>DATA-DRIVEN SPORTS INTELLIGENCE</div>
      </footer>
    </div>
  );
}
