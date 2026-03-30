import { BLOG_URL, INSTAGRAM_URL, BETMAN_URL, GAMBLING_HELPLINE } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-bg-900 border-t border-bg-700 py-8 px-6">
      <div className="max-w-[1120px] mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="font-display font-bold text-sm tracking-[-1px] text-[#F1F5F9]">MATCHLAB</div>
          <div className="flex gap-5">
            <a href={BLOG_URL} target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors font-body">블로그</a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors font-body">인스타그램</a>
          </div>
        </div>
        <div className="text-xs text-[#64748B] leading-[1.7] font-body">
          &copy; 2026 MATCHLAB<br />
          MATCHLAB은 스포츠 분석 정보 서비스이며, 베팅 결과를 보장하지 않습니다.
          합법 베팅: <a href={BETMAN_URL} target="_blank" rel="noopener noreferrer" className="underline">betman.co.kr</a> | 도박 상담: {GAMBLING_HELPLINE}
        </div>
      </div>
    </footer>
  );
}
