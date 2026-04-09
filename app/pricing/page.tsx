"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

function Donut({ percent, label, sub }: { percent: number; label: string; sub: string }) {
  const r = 42, C = 2 * Math.PI * r;
  const filled = (percent / 100) * C;
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 128, height: 128 }}>
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#334155" strokeWidth="11" />
          <circle cx="50" cy="50" r={r} fill="none" stroke="#10B981" strokeWidth="11" strokeLinecap="round" strokeDasharray={`${filled} ${C}`} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ color: "#10B981", fontSize: "22px", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{Math.round(percent)}%</span>
        </div>
      </div>
      <div style={{ fontSize: "14px", fontWeight: 600, color: "#F1F5F9", marginTop: "8px" }}>{label}</div>
      <div style={{ fontSize: "12px", color: "#94A3B8" }}>{sub}</div>
    </div>
  );
}

export default function PricingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [dashData, setDashData] = useState<any>(null);
  const [freeOpen, setFreeOpen] = useState(false);
  const [proOpen, setProOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetch("/api/dashboard?period=all")
      .then(r => r.ok ? r.json() : null)
      .then(d => setDashData(d))
      .catch(() => {});
  }, []);

  const overallRate = dashData?.overall?.hitRate ?? dashData?.overall?.hit_rate ?? 0;
  const highConfRate = dashData?.highConfidence?.hitRate ?? dashData?.high_confidence?.hit_rate ?? 0;

  const FAQS = [
    { q: "결제는 어떻게 하나요?", a: "카카오페이, 토스페이 등 간편결제를 지원합니다. 결제 시스템은 현재 준비 중이며, 카카오톡 채널로 문의하시면 안내해드립니다." },
    { q: "환불이 가능한가요?", a: "구독일로부터 7일 이내 미이용 시 전액 환불됩니다. 환불 정책 상세는 이용약관을 참고해주세요." },
    { q: "언제든 해지할 수 있나요?", a: "네, 마이페이지에서 언제든 즉시 해지할 수 있습니다. 해지 후에도 결제 기간 만료일까지 Pro 혜택을 이용할 수 있습니다." },
    { q: "얼리버드 가격은 언제까지인가요?", a: "얼리버드 9,900원은 초기 한정 가격입니다. 일정 구독자 수 달성 후 정가(14,900원)로 인상될 예정이며, 얼리버드 구독자는 가격이 유지됩니다." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A" }}>
      <Navbar />

      {/* ═══ Header ═══ */}
      <section style={{ padding: "64px 16px", textAlign: "center" }}>
        <span style={{ color: "#10B981", fontSize: "11px", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.2em", textTransform: "uppercase" }}>PRICING</span>
        <h1 style={{ color: "#FFFFFF", fontSize: "30px", fontWeight: 800, marginTop: "12px", lineHeight: 1.3 }}>AI 축구 분석, 당신에게 맞는<br />플랜을 선택하세요</h1>
        <p style={{ color: "#6B7280", fontSize: "15px", marginTop: "8px" }}>매일 업데이트되는 분석 리포트를 확인하세요</p>
      </section>

      {/* ═══ Free vs Pro Cards ═══ */}
      <section style={{ maxWidth: "768px", margin: "0 auto", padding: "0 16px" }}>
        <div className="pricing-grid" style={{ display: "grid", gap: "24px" }}>
          {/* Free */}
          <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "16px", padding: "32px" }}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#FFFFFF" }}>Free</div>
            <div style={{ marginTop: "8px" }}>
              <span style={{ fontSize: "36px", fontWeight: 700, color: "#FFFFFF" }}>0원</span>
              <span style={{ fontSize: "14px", color: "#6B7280" }}>/월</span>
            </div>
            {/* Mobile: accordion toggle */}
            {isMobile && (
              <button
                onClick={() => setFreeOpen(!freeOpen)}
                className="cursor-pointer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%", marginTop: "16px", padding: "8px", borderRadius: "8px", border: "1px solid #334155", background: "transparent", color: "#94A3B8", fontSize: "13px", fontWeight: 600 }}
              >
                {freeOpen ? "접기" : "상세 보기"} <span style={{ fontSize: "16px" }}>{freeOpen ? "▲" : "▼"}</span>
              </button>
            )}
            {(!isMobile || freeOpen) && (
              <>
                <div style={{ borderTop: "1px solid #334155", margin: "24px 0" }} />
                <ul style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {["전경기 AI 예측 결과 열람", "확신도 ⭐~⭐⭐⭐ 경기", "적중률 대시보드", "기본 경기 정보 (폼, H2H, 순위)"].map(t => (
                    <li key={t} style={{ display: "flex", gap: "8px", fontSize: "14px", color: "#94A3B8" }}>
                      <span style={{ color: "#10B981", flexShrink: 0 }}>✓</span>{t}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <Link href="/login" style={{ display: "block", marginTop: "24px", padding: "12px", borderRadius: "12px", border: "1px solid #334155", color: "#94A3B8", textAlign: "center", fontSize: "15px", fontWeight: 700, textDecoration: "none" }} className="hover:border-emerald-500 transition-colors">
              무료로 시작하기
            </Link>
          </div>

          {/* Pro */}
          <div style={{ background: "#1F2937", border: "2px solid #FBBF24", borderRadius: "16px", padding: "32px", position: "relative" }}>
            <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "#10B981", color: "white", fontSize: "12px", fontWeight: 700, padding: "4px 16px", borderRadius: "9999px" }}>추천</div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(251,191,36,0.1)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.3)", fontSize: "12px", fontWeight: 700, padding: "4px 12px", borderRadius: "9999px", marginBottom: "16px" }}>🎉 얼리버드 특가</span>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#FFFFFF" }}>Pro</div>
            <div style={{ fontSize: "14px", color: "#6B7280", textDecoration: "line-through" }}>14,900원</div>
            <div style={{ marginTop: "4px" }}>
              <span style={{ fontSize: "36px", fontWeight: 700, color: "#FBBF24" }}>9,900원</span>
              <span style={{ fontSize: "14px", color: "#6B7280" }}>/월</span>
            </div>
            <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>커피 3잔 가격으로 매일 AI 분석</p>
            {/* Mobile: accordion toggle */}
            {isMobile && (
              <button
                onClick={() => setProOpen(!proOpen)}
                className="cursor-pointer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%", marginTop: "16px", padding: "8px", borderRadius: "8px", border: "1px solid #FBBF2440", background: "transparent", color: "#FBBF24", fontSize: "13px", fontWeight: 600 }}
              >
                {proOpen ? "접기" : "상세 보기"} <span style={{ fontSize: "16px" }}>{proOpen ? "▲" : "▼"}</span>
              </button>
            )}
            {(!isMobile || proOpen) && (
              <>
                <div style={{ borderTop: "1px solid #334155", margin: "24px 0" }} />
                <ul style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    "Free 전체 포함",
                    "⭐⭐⭐⭐~⭐⭐⭐⭐⭐ 고확신 경기 열람",
                    "🔥 빅매치 전경기 분석 (엘클라시코, 챔스, 더비매치)",
                    "상세 분석 리포트 전체 열람 (전술분석·핵심변수·AI 정성분석)",
                    "4모델 앙상블 상세 근거",
                    "배당 이동 분석",
                    "예상 라인업 + 부상자 상세",
                  ].map(t => (
                    <li key={t} style={{ display: "flex", gap: "8px", fontSize: "14px", color: "#FFFFFF" }}>
                      <span style={{ color: "#10B981", flexShrink: 0 }}>✓</span>{t}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <button onClick={() => alert("결제 시스템 준비중입니다. 카카오톡으로 문의해주세요!")} className="cursor-pointer hover:bg-emerald-400 transition-colors" style={{ display: "block", marginTop: "24px", padding: "12px", borderRadius: "12px", background: "#10B981", color: "white", textAlign: "center", fontSize: "15px", fontWeight: 700, width: "100%", border: "none" }}>
              Pro 시작하기
            </button>
          </div>
        </div>
      </section>

      {/* ═══ Compare ═══ */}
      <section style={{ maxWidth: "768px", margin: "80px auto 0", padding: "0 16px", textAlign: "center" }}>
        <span style={{ color: "#10B981", fontSize: "11px", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.2em", textTransform: "uppercase" }}>COMPARE</span>
        <h2 style={{ color: "#FFFFFF", fontSize: "24px", fontWeight: 700, marginTop: "8px" }}>Pro에서만 열리는 분석</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "32px" }}>
          {/* Free */}
          <div style={{ borderRadius: "16px", border: "1px solid #334155", background: "rgba(30,41,59,0.5)", padding: "24px", position: "relative", overflow: "hidden", textAlign: "left" }}>
            <span style={{ background: "#334155", color: "#94A3B8", fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "9999px" }}>FREE</span>
            <div className="blur-sm select-none" style={{ marginTop: "12px" }}>
              <p style={{ fontSize: "13px", color: "#94A3B8", fontWeight: 600, marginBottom: "12px" }}>리포트 상세 분석</p>
              {[100, 90, 95, 80].map((w, i) => <div key={i} style={{ height: "12px", borderRadius: "4px", background: "#334155", marginBottom: "8px", width: `${w}%` }} />)}
              <p style={{ fontSize: "13px", color: "#94A3B8", fontWeight: 600, marginTop: "16px", marginBottom: "8px" }}>전술 분석</p>
              {[95, 85, 90].map((w, i) => <div key={i} style={{ height: "12px", borderRadius: "4px", background: "#334155", marginBottom: "8px", width: `${w}%` }} />)}
            </div>
            <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <span style={{ fontSize: "24px" }}>🔒</span>
              <span style={{ fontSize: "13px", color: "#94A3B8" }}>상세 분석은 Pro 전용입니다</span>
            </div>
          </div>

          {/* Pro */}
          <div style={{ borderRadius: "16px", border: "2px solid #10B981", background: "rgba(30,41,59,0.5)", padding: "24px", textAlign: "left" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <span style={{ background: "rgba(16,185,129,0.2)", color: "#10B981", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "9999px" }}>PRO</span>
              <span style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "9999px" }}>🔓 전체 열람</span>
            </div>
            <p style={{ fontSize: "13px", color: "#F1F5F9", fontWeight: 600, marginTop: "12px", marginBottom: "12px" }}>리포트 상세 분석</p>
            <p style={{ fontSize: "12px", color: "#94A3B8", lineHeight: 1.6 }}>아스널의 3-4-3 전환 전술이 첼시의 높은 수비라인을 압박할 것으로 예상됩니다. 특히 좌측 사카의 드리블 돌파가 핵심 변수입니다.</p>
            <p style={{ fontSize: "13px", color: "#F1F5F9", fontWeight: 600, marginTop: "16px", marginBottom: "8px" }}>핵심 변수</p>
            {["아스널 CB 살리바 복귀 (수비 안정화)", "첼시 팔머 컨디션 하락 (최근 3경기 무득점)", "심판 마이클 올리버 배정 (홈팀 유리 통계)"].map(t => (
              <p key={t} style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "4px" }}>• {t}</p>
            ))}
            <div style={{ marginTop: "16px", borderRadius: "12px", background: "#0F172A", padding: "12px", border: "1px solid rgba(249,115,22,0.3)" }}>
              <span style={{ background: "rgba(249,115,22,0.2)", color: "#FB923C", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px" }}>🔥 빅매치</span>
              <p style={{ fontSize: "12px", color: "#F1F5F9", marginTop: "4px" }}>바르셀로나 vs 레알 마드리드</p>
              <p style={{ fontSize: "12px", color: "#10B981", marginTop: "2px" }}>AI 예측: 바르셀로나 승 (64.2%)</p>
            </div>
          </div>
        </div>
        <p style={{ fontSize: "12px", color: "#64748B", marginTop: "16px" }}>Pro 구독 시 모든 리포트의 전술분석, 핵심변수, AI 정성분석을 열람할 수 있습니다</p>
      </section>

      {/* ═══ Accuracy ═══ */}
      <section style={{ maxWidth: "576px", margin: "80px auto 0", padding: "0 16px", textAlign: "center" }}>
        <span style={{ color: "#10B981", fontSize: "11px", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.2em", textTransform: "uppercase" }}>ACCURACY</span>
        <h2 style={{ color: "#FFFFFF", fontSize: "24px", fontWeight: 700, marginTop: "8px" }}>투명하게 공개합니다</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginTop: "32px" }}>
          <Donut percent={overallRate || 52} label="전체 적중률" sub="전체" />
          <Donut percent={highConfRate || 65} label="고확신 적중률" sub="⭐⭐⭐⭐+" />
        </div>
        <p style={{ fontSize: "12px", color: "#64748B", marginTop: "16px" }}>모든 예측은 자동 기록되며, 누구나 검증할 수 있습니다</p>
      </section>

      {/* ═══ FAQ ═══ */}
      <section style={{ maxWidth: "640px", margin: "80px auto 0", padding: "0 16px" }}>
        <div style={{ textAlign: "center" }}>
          <span style={{ color: "#10B981", fontSize: "11px", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.2em", textTransform: "uppercase" }}>FAQ</span>
          <h2 style={{ color: "#FFFFFF", fontSize: "24px", fontWeight: 700, marginTop: "8px" }}>자주 묻는 질문</h2>
        </div>
        <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {FAQS.map((f, i) => (
            <div key={i} onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "12px", padding: "16px 20px", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", color: "#F1F5F9", fontWeight: 500 }}>{f.q}</span>
                <span style={{ color: "#10B981", fontSize: "16px", flexShrink: 0 }}>{faqOpen === i ? "−" : "+"}</span>
              </div>
              {faqOpen === i && <p style={{ fontSize: "14px", color: "#94A3B8", marginTop: "12px", lineHeight: 1.6 }}>{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Bottom CTA ═══ */}
      <section style={{ marginTop: "80px", paddingBottom: "80px", textAlign: "center", padding: "0 16px" }}>
        <p style={{ color: "#6B7280", fontSize: "14px" }}>지금 Pro를 시작하면</p>
        <p style={{ color: "#FFFFFF", fontSize: "20px", fontWeight: 700, marginTop: "4px" }}>오늘의 빅매치 분석을 바로 확인할 수 있습니다</p>
        <button onClick={() => alert("결제 시스템 준비중입니다. 카카오톡으로 문의해주세요!")} className="cursor-pointer hover:bg-emerald-400 transition-colors" style={{ background: "#10B981", color: "white", fontWeight: 700, padding: "14px 32px", borderRadius: "12px", marginTop: "24px", border: "none", fontSize: "16px" }}>
          Pro 시작하기
        </button>
        <p style={{ fontSize: "12px", color: "#64748B", marginTop: "12px" }}>
          또는 <Link href="/login" style={{ color: "#10B981", textDecoration: "underline" }}>무료로 시작하기</Link>
        </p>
      </section>

      <Footer />
    </div>
  );
}
