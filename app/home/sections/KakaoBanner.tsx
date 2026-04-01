import { KAKAO_CHANNEL_URL } from "@/lib/constants";

export default function KakaoBanner() {
  return (
    <a
      href={KAKAO_CHANNEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="block mx-4 mb-4 rounded-xl p-3.5 min-h-[44px]"
      style={{
        background: "#371d00",
        border: "1px solid #FEE75C",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[20px]"
          style={{ background: "#FEE75C" }}
        >
          💬
        </div>
        <div>
          <div className="text-[13px] font-semibold" style={{ color: "#FEE75C" }}>
            매일 아침 카톡으로도 받기
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: "#a3884d" }}>
            카카오톡 채널 추가하기 →
          </div>
        </div>
      </div>
    </a>
  );
}
