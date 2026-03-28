import { KAKAO_CHANNEL_URL } from "@/lib/constants";
import KakaoMockup from "./KakaoMockup";

const LEAGUES = [
  { name: "EPL", className: "bg-[#f3e8ff] text-[#7c3aed]" },
  { name: "La Liga", className: "bg-[#fff7ed] text-[#c2410c]" },
  { name: "Serie A", className: "bg-[#dbeafe] text-[#1d4ed8]" },
  { name: "Bundesliga", className: "bg-[#fee2e2] text-[#dc2626]" },
  { name: "Ligue 1", className: "bg-[#dcfce7] text-[#16a34a]" },
  { name: "UCL", className: "bg-[#e0e7ff] text-[#4338ca]" },
  { name: "UEL", className: "bg-[#fef3c7] text-[#b45309]" },
];

const KakaoSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.86 5.22 4.65 6.6l-.96 3.56c-.08.28.24.52.48.36l4.2-2.78c.53.06 1.07.1 1.63.1 5.52 0 10-3.58 10-7.84C22 6.58 17.52 3 12 3z" />
  </svg>
);

export default function Hero() {
  return (
    <section className="px-6 pt-[72px] pb-14 max-w-[1120px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_360px] gap-14 items-center min-h-[calc(100vh-56px)]">
      {/* Left: Content */}
      <div className="flex flex-col gap-5 text-center md:text-left">
        <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
          {LEAGUES.map((l) => (
            <span
              key={l.name}
              className={`${l.className} text-[11px] font-semibold px-2.5 py-1 rounded-full`}
            >
              {l.name}
            </span>
          ))}
        </div>

        <div className="text-[13px] font-semibold text-ml-accent tracking-[0.04em]">
          AI FOOTBALL ANALYSIS
        </div>

        <h1 className="text-[32px] md:text-[46px] font-[900] leading-[1.12] tracking-[-0.035em] break-keep">
          AI가 오늘의<br />축구를 <em className="not-italic text-ml-accent">읽습니다</em>
        </h1>

        <p className="text-[17px] leading-[1.7] text-ml-sub max-w-[460px] break-keep mx-auto md:mx-0">
          매일 30경기를 직접 분석할 시간이 없다면.
          AI가 12개 리그를 데이터로 읽고, 가장 확률 높은 경기를 골라 보내드립니다.
        </p>

        <div className="flex flex-wrap gap-3 mt-1 justify-center md:justify-start">
          <a
            href={KAKAO_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-ml-kakao text-[#1a1a1a] text-base font-bold px-8 py-3.5 rounded-full hover:brightness-95 hover:-translate-y-px transition-all"
          >
            <KakaoSvg />
            무료로 시작하기
          </a>
          <a
            href="#dashboard"
            className="inline-flex items-center text-ml-accent text-base font-semibold px-8 py-3.5 rounded-full border-2 border-ml-accent hover:bg-ml-accent-light transition-all"
          >
            적중률 보기
          </a>
        </div>

        <div className="flex items-center gap-3 text-[13px] text-ml-muted justify-center md:justify-start">
          <span>회원가입 필요 없음</span>
          <span>·</span>
          <span>완전 무료</span>
          <span>·</span>
          <span>언제든 구독 취소</span>
        </div>
      </div>

      {/* Right: Kakao Mockup */}
      <div className="mx-auto md:mx-0">
        <KakaoMockup />
      </div>
    </section>
  );
}
