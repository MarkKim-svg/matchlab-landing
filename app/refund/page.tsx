import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "환불정책 — MATCHLAB",
};

export default function RefundPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg-900 text-[#F1F5F9]">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="text-2xl font-display font-bold tracking-tight mb-2">환불정책</h1>
          <p className="text-sm text-[#64748B] mb-10">시행일: 2026년 4월 1일</p>

          <div className="space-y-8 text-sm leading-[1.8] text-[#94A3B8] font-body">
            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">1. 환불 원칙</h2>
              <p>
                MATCHLAB Pro 구독은 디지털 콘텐츠의 특성상, 구독 기간 중 환불이 원칙적으로 불가합니다.
                다만, 아래의 예외 사유에 해당하는 경우 환불이 가능합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">2. 환불 가능 사유</h2>

              <div className="space-y-4 mt-2">
                <div className="bg-bg-800 rounded-xl p-4 border border-bg-700">
                  <p className="font-medium text-[#E2E8F0] mb-1">예외 1: 미이용 시 전액 환불</p>
                  <p>
                    결제 후 7일 이내에 서비스를 이용하지 않은 경우(Pro 분석 열람 기록이 없는 경우),
                    전액 환불이 가능합니다.
                  </p>
                </div>

                <div className="bg-bg-800 rounded-xl p-4 border border-bg-700">
                  <p className="font-medium text-[#E2E8F0] mb-1">예외 2: 서비스 장애 시 일할 환불</p>
                  <p>
                    회사의 귀책사유로 서비스 장애가 연속 3일 이상 발생한 경우,
                    장애 기간에 해당하는 금액을 일할 계산하여 환불합니다.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">3. 환불 신청 방법</h2>
              <p>
                환불을 원하시는 경우{" "}
                <a href="mailto:minkuikim@gmail.com" className="text-emerald-400 hover:underline">
                  minkuikim@gmail.com
                </a>
                으로 아래 정보를 포함하여 요청해 주세요.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>가입 이메일 주소</li>
                <li>결제일</li>
                <li>환불 사유</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">4. 처리 기간</h2>
              <p>
                환불 신청 후 <strong className="text-[#E2E8F0]">3영업일 이내</strong>에 처리됩니다.
                결제 수단에 따라 실제 환불 반영까지 추가 시간이 소요될 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">5. 정기결제 해지</h2>
              <p>
                마이페이지에서 언제든지 정기결제를 해지할 수 있습니다.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>해지 시 현재 구독 기간이 끝날 때까지 Pro 서비스를 계속 이용할 수 있습니다.</li>
                <li>다음 결제일부터는 자동결제가 이루어지지 않습니다.</li>
                <li>해지 후에도 무료(Free) 서비스는 계속 이용 가능합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">6. 관련 법령</h2>
              <p>
                본 환불정책은 전자상거래 등에서의 소비자보호에 관한 법률 제17조(청약철회 등)를 준수합니다.
                디지털 콘텐츠의 경우 콘텐츠 이용이 개시된 이후에는 청약철회가 제한될 수 있으며,
                이에 대해 회원가입 및 결제 시 사전 고지하고 동의를 받습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">7. 문의</h2>
              <p>
                환불 관련 문의:{" "}
                <a href="mailto:minkuikim@gmail.com" className="text-emerald-400 hover:underline">
                  minkuikim@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
