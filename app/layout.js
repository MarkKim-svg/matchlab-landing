import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "MATCHLAB — AI 축구 경기 분석",
  description:
    "20개 리그 축구 경기를 AI가 데이터로 분석하고 카카오톡으로 보내드립니다",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
