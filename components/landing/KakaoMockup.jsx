const KakaoIcon = () => (
  <svg viewBox="0 0 24 24" fill="#1a1a1a" className="w-[18px] h-[18px]">
    <path d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.86 5.22 4.65 6.6l-.96 3.56c-.08.28.24.52.48.36l4.2-2.78c.53.06 1.07.1 1.63.1 5.52 0 10-3.58 10-7.84C22 6.58 17.52 3 12 3z" />
  </svg>
);

export default function KakaoMockup() {
  return (
    <div className="w-[340px] md:w-[360px]">
      <div className="bg-white rounded-[36px] border-[8px] border-[#1f1f1f] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)]">
        {/* Notch */}
        <div className="h-6 bg-[#1f1f1f] rounded-b-[14px] mx-auto w-[110px]" />

        {/* Kakao Header */}
        <div className="bg-ml-kakao px-4 py-2.5 flex items-center gap-2 text-sm font-bold text-[#1a1a1a]">
          <KakaoIcon />
          MATCHLAB
        </div>

        {/* Kakao Body */}
        <div className="bg-[#b2c7d9] px-3.5 py-3.5 min-h-[400px] flex flex-col gap-1.5">
          <div className="text-[10px] text-black/35 mb-0.5">오전 10:00</div>

          {/* Message Bubble */}
          <div className="bg-white rounded-xl px-4 py-3.5 text-[13px] leading-[1.65] text-[#1a1a1a] max-w-[275px] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <div className="font-bold text-[13px] mb-2.5 pb-2 border-b border-[#f0f0f0]">
              MATCHLAB AI 분석 · 3월 28일
            </div>
            <div className="text-[11px] text-[#888] mb-1.5">오늘의 무료 프리뷰 (2경기)</div>

            {/* Match 1 */}
            <div className="py-1.5 border-b border-[#f5f5f5]">
              <div className="font-semibold text-[13px] mb-0.5">아스널 vs 첼시</div>
              <div className="text-[11px] text-[#999]">EPL · 04:00</div>
              <div className="text-xs mt-0.5">
                AI 예측: <strong className="text-ml-accent">아스널 승 (62.3%)</strong>{" "}
                <span className="text-[#f59e0b] text-[10px]">★★★</span>
              </div>
            </div>

            {/* Match 2 */}
            <div className="py-1.5">
              <div className="font-semibold text-[13px] mb-0.5">바르셀로나 vs 비야레알</div>
              <div className="text-[11px] text-[#999]">La Liga · 05:00</div>
              <div className="text-xs mt-0.5">
                AI 예측: <strong className="text-ml-accent">오버 2.5 (71.8%)</strong>{" "}
                <span className="text-[#f59e0b] text-[10px]">★★★</span>
              </div>
            </div>
          </div>

          {/* Locked Message */}
          <div className="bg-gradient-to-br from-[#f0f4ff] to-[#e8eeff] border border-dashed border-[#93b4fd] rounded-xl px-3.5 py-3 text-[11px] text-[#4b72cf] text-center leading-relaxed max-w-[275px]">
            <strong className="block text-xs mb-0.5">유료 전용: 고확신 경기 4건</strong>
            확신도 ★★★★ 이상 고확신 경기<br />결과는 내일 공개됩니다
          </div>

          {/* CTA */}
          <div className="bg-ml-accent text-white rounded-lg py-2.5 text-center text-xs font-semibold max-w-[275px] mt-0.5">
            Pro에서 전경기 보기 →
          </div>
        </div>
      </div>
    </div>
  );
}
