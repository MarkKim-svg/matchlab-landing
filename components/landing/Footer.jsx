import {
  BLOG_URL,
  INSTAGRAM_URL,
  BETMAN_URL,
  GAMBLING_HELPLINE,
} from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-ml-border py-8 px-6 max-w-[1120px] mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="font-[800] text-sm">MATCHLAB</div>
        <div className="flex gap-5">
          <a
            href={BLOG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-ml-sub hover:text-ml-text transition-colors"
          >
            블로그
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-ml-sub hover:text-ml-text transition-colors"
          >
            인스타그램
          </a>
        </div>
      </div>
      <div className="text-[11px] text-ml-muted leading-[1.7]">
        &copy; 2026 MATCHLAB<br />
        MATCHLAB은 데이터 기반 스포츠 분석 정보 서비스이며, 베팅 결과를 보장하지 않습니다.
        스포츠토토는{" "}
        <a href={BETMAN_URL} target="_blank" rel="noopener noreferrer" className="underline">
          betman.co.kr
        </a>
        에서만 합법적으로 구매할 수 있습니다.
        도박 과몰입 상담: {GAMBLING_HELPLINE}
      </div>
    </footer>
  );
}
