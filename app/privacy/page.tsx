import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "개인정보처리방침 — MATCHLAB",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg-900 text-[#F1F5F9]">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="text-2xl font-display font-bold tracking-tight mb-2">개인정보처리방침</h1>
          <p className="text-sm text-[#64748B] mb-10">시행일: 2026년 4월 1일</p>

          <div className="space-y-8 text-sm leading-[1.8] text-[#94A3B8] font-body">
            <p>
              매치랩(MATCHLAB, 이하 &quot;회사&quot;)은 개인정보보호법에 따라 이용자의 개인정보를 보호하고
              이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.
            </p>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제1조 (수집항목)</h2>
              <p className="font-medium text-[#E2E8F0] mt-2">필수 수집 항목</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>이메일 주소</li>
                <li>이름(닉네임)</li>
                <li>소셜 로그인 식별자 (카카오, 구글)</li>
              </ul>
              <p className="font-medium text-[#E2E8F0] mt-3">결제 관련</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>결제 정보 (카드번호는 PG사(NHN KCP 등)가 직접 처리하며, 회사는 카드번호를 저장하지 않습니다)</li>
              </ul>
              <p className="font-medium text-[#E2E8F0] mt-3">자동 수집</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>접속 IP, 접속 일시, 서비스 이용 기록</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제2조 (수집 목적)</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>회원 관리: 회원 식별, 가입 의사 확인, 본인 확인</li>
                <li>서비스 제공: AI 스포츠 분석 정보 제공, 맞춤형 콘텐츠 제공</li>
                <li>결제 처리: 유료 서비스 결제 및 정기결제 관리</li>
                <li>고객 문의 응대: 문의사항 처리 및 불만 대응</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제3조 (보유 기간)</h2>
              <p>회원 탈퇴 시 즉시 파기합니다. 단, 관련 법령에 따라 다음 기간 동안 보관합니다.</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>전자상거래 등에서의 소비자보호에 관한 법률에 따른 거래 기록: <strong className="text-[#E2E8F0]">5년</strong></li>
                <li>소비자 불만 또는 분쟁 처리에 관한 기록: <strong className="text-[#E2E8F0]">3년</strong></li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제4조 (제3자 제공)</h2>
              <p>회사는 결제 처리 목적으로 다음 제3자에게 개인정보를 제공합니다.</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong className="text-[#E2E8F0]">NHN KCP</strong> — 신용카드 결제 처리</li>
                <li><strong className="text-[#E2E8F0]">카카오페이</strong> — 카카오페이 결제 처리</li>
                <li><strong className="text-[#E2E8F0]">토스페이</strong> — 토스페이 결제 처리</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제5조 (위탁)</h2>
              <p>회사는 서비스 운영을 위해 다음 업체에 개인정보 처리를 위탁하고 있습니다.</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong className="text-[#E2E8F0]">포트원(PortOne)</strong> — 결제 연동 및 처리</li>
                <li><strong className="text-[#E2E8F0]">Supabase</strong> — 데이터 저장 및 인증</li>
                <li><strong className="text-[#E2E8F0]">Vercel</strong> — 웹 호스팅 및 서비스 배포</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제6조 (이용자 권리)</h2>
              <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>개인정보 열람, 수정, 삭제 요청</li>
                <li>개인정보 수집·이용 동의 철회</li>
              </ul>
              <p className="mt-2">
                마이페이지에서 직접 처리하거나, 이메일(
                <a href="mailto:minkuikim@gmail.com" className="text-emerald-400 hover:underline">minkuikim@gmail.com</a>
                )로 요청할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제7조 (쿠키)</h2>
              <p>
                회사는 서비스 이용 분석 및 맞춤형 서비스 제공을 위해 쿠키를 사용합니다.
                이용자는 웹 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으며,
                이 경우 일부 서비스 이용에 제한이 있을 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제8조 (개인정보보호 책임자)</h2>
              <ul className="space-y-1">
                <li>성명: 김민규</li>
                <li>직위: 대표</li>
                <li>이메일: <a href="mailto:minkuikim@gmail.com" className="text-emerald-400 hover:underline">minkuikim@gmail.com</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">제9조 (고충처리)</h2>
              <p>개인정보 침해에 대한 신고나 상담이 필요한 경우 아래 기관에 문의하시기 바랍니다.</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>개인정보침해신고센터: 118 (privacy.kisa.or.kr)</li>
                <li>개인정보분쟁조정위원회: 1833-6972 (kopico.go.kr)</li>
                <li>대검찰청 사이버수사과: 1301 (spo.go.kr)</li>
                <li>경찰청 사이버안전국: 182 (police.go.kr)</li>
              </ul>
            </section>

            <section>
              <p className="text-[#64748B]">이 개인정보처리방침은 2026년 4월 1일부터 시행합니다.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
