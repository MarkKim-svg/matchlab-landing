import Link from "next/link";
import { BLOG_URL, INSTAGRAM_URL, BETMAN_URL, GAMBLING_HELPLINE, SUPPORT_PHONE, SUPPORT_EMAIL } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-bg-900 border-t border-[#152035] pt-8 pb-28 md:pb-10 px-6">
      <div className="max-w-[1120px] mx-auto">
        {/* 상단: 로고 + 외부링크 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="font-display font-bold text-sm tracking-[-1px] text-[#E1E7EF]">MATCHLAB</div>
          <div className="flex gap-5">
            <a href={BLOG_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[13px] text-[#8494A7] hover:text-[#E1E7EF] transition-colors font-body">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 2.5h-4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-4m-7 1 7-7m0 0h-3m3 0v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M4 7.5h4M4 9.5h6M4 11.5h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
              블로그
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[13px] text-[#8494A7] hover:text-[#E1E7EF] transition-colors font-body">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
              인스타그램
            </a>
          </div>
        </div>

        {/* 사업자 정보 */}
        <div className="text-xs text-[#566378] leading-[1.8] font-body space-y-1">
          <p>매치랩 (MATCHLAB) | 대표: 김민규 | 사업자등록번호: 507-61-04570</p>
          <p>주소: 경기도 수원시 영통구 센트럴파크로 60, 6302동 2703호(이의동, 래미안 광교)</p>
          <p>이메일: {SUPPORT_EMAIL} | 전화: {SUPPORT_PHONE}</p>
        </div>

        {/* 약관 링크 */}
        <div className="flex flex-wrap gap-4 mt-4">
          <Link href="/terms" className="text-xs text-[#8494A7] hover:text-[#E1E7EF] transition-colors font-body">이용약관</Link>
          <Link href="/privacy" className="text-xs text-[#8494A7] hover:text-[#E1E7EF] transition-colors font-body">개인정보처리방침</Link>
          <Link href="/refund" className="text-xs text-[#8494A7] hover:text-[#E1E7EF] transition-colors font-body">환불정책</Link>
        </div>

        {/* 면책 + 합법 베팅 안내 */}
        <div className="mt-6 pt-4 border-t border-[#152035]">
          <p className="text-xs text-[#566378] leading-[1.7] font-body">
            &copy; 2026 MATCHLAB. All rights reserved.<br />
            MATCHLAB은 스포츠 분석 정보 서비스이며, 베팅을 권유하지 않습니다.<br />
            합법적 스포츠베팅: <a href={BETMAN_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#8494A7]">betman.co.kr</a> | 도박 과몰입 상담: {GAMBLING_HELPLINE} (한국도박문제관리센터)
          </p>
        </div>
      </div>
    </footer>
  );
}
