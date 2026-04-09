import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "이용약관 — MATCHLAB",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg-900 text-[#F1F5F9]">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="text-2xl font-display font-bold tracking-tight mb-2">이용약관</h1>
          <p className="text-sm text-[#64748B] mb-10">시행일: 2026년 4월 1일</p>

          <div className="space-y-8 text-sm leading-[1.8] text-[#94A3B8] font-body">
            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제1조 (목적)</h2>
              <p>
                이 약관은 매치랩(MATCHLAB, 이하 &quot;회사&quot;)이 제공하는 AI 스포츠 분석 정보 서비스(이하 &quot;서비스&quot;)의
                이용 조건 및 절차, 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제2조 (정의)</h2>
              <ul className="list-disc list-inside space-y-1 text-[#94A3B8]">
                <li>&quot;서비스&quot;란 회사가 제공하는 AI 기반 스포츠 경기 분석 정보 구독 서비스를 말합니다.</li>
                <li>&quot;회원&quot;이란 서비스에 가입하여 이용 계약을 체결한 자를 말합니다.</li>
                <li>&quot;유료서비스&quot;란 Pro 구독 등 회사가 유료로 제공하는 서비스를 말합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제3조 (약관의 효력)</h2>
              <p>
                이 약관은 서비스 웹사이트에 게시하여 공지하며, 회원이 서비스에 가입함으로써 약관에 동의한 것으로 봅니다.
                회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 웹사이트에 게시한 날로부터 효력이 발생합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제4조 (회원가입)</h2>
              <p>
                회원가입은 카카오, 구글 소셜 로그인 또는 이메일 가입을 통해 이루어집니다.
                회사는 다음 각 호에 해당하는 경우 가입을 거부할 수 있습니다.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>실명이 아니거나 타인의 정보를 이용한 경우</li>
                <li>허위 정보를 기재한 경우</li>
                <li>만 19세 미만인 경우</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제5조 (회원탈퇴)</h2>
              <p>
                회원은 마이페이지에서 언제든지 탈퇴를 요청할 수 있으며, 회사는 요청 즉시 탈퇴를 처리합니다.
                탈퇴 시 회원의 개인정보는 개인정보처리방침에 따라 처리됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제6조 (서비스 내용)</h2>
              <p>회사가 제공하는 서비스는 다음과 같습니다.</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong className="text-[#F1F5F9]">무료(Free)</strong>: 하루 프리뷰 분석 2경기 제공</li>
                <li><strong className="text-[#F1F5F9]">Pro 구독</strong>: 전경기 분석 + 고확신 픽 + 시장 지표 분석 제공</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제7조 (유료서비스 및 결제)</h2>
              <p>
                Pro 구독은 월 9,900원이며, 포트원(PortOne)을 통한 정기결제로 처리됩니다.
                결제는 신용카드, 카카오페이, 토스페이 등을 통해 이루어지며,
                정기결제는 매월 동일한 결제일에 자동으로 갱신됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제8조 (청약철회 및 환불)</h2>
              <p>
                유료서비스의 청약철회 및 환불에 관한 사항은{" "}
                <a href="/refund" className="text-emerald-400 hover:underline">환불정책</a> 페이지를 참조하시기 바랍니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제9조 (서비스 변경 및 중단)</h2>
              <p>
                회사는 운영상·기술상의 필요에 따라 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.
                서비스 변경 또는 중단 시 최소 7일 전 웹사이트를 통해 사전 고지합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제10조 (면책)</h2>
              <p>
                서비스에서 제공하는 AI 분석 정보는 참고용 정보이며, 경기 결과를 보장하지 않습니다.
                이용자가 서비스에서 제공한 정보를 근거로 한 투자, 베팅 등으로 발생한 손실에 대해
                회사는 어떠한 책임도 지지 않습니다. 본 서비스는 정보 제공 서비스이며, 베팅을 권유하지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제11조 (지적재산권)</h2>
              <p>
                서비스에서 제공하는 AI 분석 콘텐츠, 디자인, 로고, 텍스트 등 일체의 저작물에 대한
                저작권 및 지적재산권은 회사에 귀속됩니다. 이용자는 회사의 사전 서면 동의 없이
                이를 복제, 배포, 전송, 2차 저작 등의 방법으로 이용할 수 없습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제12조 (분쟁 해결)</h2>
              <p>
                서비스 이용과 관련하여 회사와 이용자 간에 분쟁이 발생한 경우,
                양 당사자는 분쟁 해결을 위해 성실히 협의합니다.
                협의가 이루어지지 않는 경우 수원지방법원을 관할 법원으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">부칙</h2>
              <p>이 약관은 2026년 4월 1일부터 시행합니다.</p>
            </section>
          </div>

          {/* 합법 베팅 안내 */}
          <div className="mt-12 pt-6 border-t border-bg-700">
            <p className="text-xs text-[#64748B] leading-[1.7] font-body">
              합법적 스포츠베팅은{" "}
              <a href="https://www.betman.co.kr" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#94A3B8]">
                betman.co.kr
              </a>
              을 이용하세요.<br />
              도박 과몰입 상담: 1336 (한국도박문제관리센터)
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
