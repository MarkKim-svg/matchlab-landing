import Link from "next/link";
import { BLOG_URL, INSTAGRAM_URL, BETMAN_URL, GAMBLING_HELPLINE } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-bg-900 border-t border-bg-700 pt-8 pb-10 px-6">
      <div className="max-w-[1120px] mx-auto">
        {/* 상단: 로고 + 외부링크 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="font-display font-bold text-sm tracking-[-1px] text-[#F1F5F9]">MATCHLAB</div>
          <div className="flex gap-5">
            <a href={BLOG_URL} target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors font-body">블로그</a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors font-body">인스타그램</a>
          </div>
        </div>

        {/* 사업자 정보 */}
        <div className="text-xs text-[#64748B] leading-[1.8] font-body space-y-1">
          <p>매치랩 (MATCHLAB) | 대표: 김민규 | 사업자등록번호: 507-61-04570</p>
          <p>주소: 경기도 수원시 영통구 이의동 센트럴파크로 60 래미안 6302동 2703호</p>
          <p>이메일: minkuikim@gmail.com | 전화: 010-6481-8265</p>
        </div>

        {/* 약관 링크 */}
        <div className="flex flex-wrap gap-4 mt-4">
          <Link href="/terms" className="text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors font-body">이용약관</Link>
          <Link href="/privacy" className="text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors font-body">개인정보처리방침</Link>
          <Link href="/refund" className="text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors font-body">환불정책</Link>
        </div>

        {/* 면책 + 합법 베팅 안내 */}
        <div className="mt-6 pt-4 border-t border-bg-700">
          <p className="text-xs text-[#64748B] leading-[1.7] font-body">
            &copy; 2026 MATCHLAB. All rights reserved.<br />
            MATCHLAB은 스포츠 분석 정보 서비스이며, 베팅을 권유하지 않습니다.<br />
            합법적 스포츠베팅: <a href={BETMAN_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#94A3B8]">betman.co.kr</a> | 도박 과몰입 상담: {GAMBLING_HELPLINE} (한국도박문제관리센터)
          </p>
        </div>
      </div>
    </footer>
  );
}
