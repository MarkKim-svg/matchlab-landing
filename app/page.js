import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem 2rem",
          textAlign: "center",
          background: "#0a0a0a",
          color: "#fff",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>
          MATCHLAB — AI 스포츠 분석
        </h1>
        <p style={{ fontSize: "1.125rem", color: "#888", marginBottom: "3rem" }}>
          Sprint 2 랜딩페이지 개발 중
        </p>

        {/* TODO: 섹션 컴포넌트 배치 */}
        {/* <HeroSection /> */}
        {/* <ResultsSection /> */}
        {/* <PricingSection /> */}
        {/* <FaqSection /> */}
        {/* <CtaSection /> */}
      </main>
    </>
  );
}
