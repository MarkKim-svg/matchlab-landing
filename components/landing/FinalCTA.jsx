import FadeSection from "@/lib/FadeSection";
import { KAKAO_CHANNEL_URL } from "@/lib/constants";

const KakaoSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.86 5.22 4.65 6.6l-.96 3.56c-.08.28.24.52.48.36l4.2-2.78c.53.06 1.07.1 1.63.1 5.52 0 10-3.58 10-7.84C22 6.58 17.52 3 12 3z" />
  </svg>
);

export default function FinalCTA() {
  return (
    <FadeSection>
      <section className="py-20 px-6 text-center">
        <h2 className="text-[32px] font-[800] mb-3 tracking-[-0.02em]">
          매일 아침, 분석이 카톡으로
        </h2>
        <p className="text-base text-ml-sub mb-7">
          채널 추가만 하면 매일 경기 전 분석이 도착합니다
        </p>
        <a
          href={KAKAO_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-ml-kakao text-[#1a1a1a] text-base font-bold px-8 py-3.5 rounded-full hover:brightness-95 hover:-translate-y-px transition-all"
        >
          <KakaoSvg />
          무료로 시작하기
        </a>
        <div className="mt-4 text-[13px] text-ml-muted">
          회원가입 필요 없음 · 완전 무료 · 언제든 구독 취소
        </div>
      </section>
    </FadeSection>
  );
}
