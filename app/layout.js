import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "700"],
});

export const metadata = {
  title: "MATCHLAB — AI 축구 경기 분석",
  description:
    "20개 리그 축구 경기를 AI가 데이터로 분석하고 카카오톡으로 보내드립니다",
  openGraph: {
    title: "MATCHLAB — AI 축구 경기 분석",
    description:
      "AI가 매일 경기를 분석하고, 적중 확률 높은 경기를 알려드립니다.",
    siteName: "MATCHLAB",
    type: "website",
    locale: "ko_KR",
    // TODO: og:image 추가
  },
  twitter: {
    card: "summary_large_image",
    title: "MATCHLAB — AI 축구 경기 분석",
    description:
      "AI가 매일 경기를 분석하고, 적중 확률 높은 경기를 알려드립니다.",
    // TODO: og:image 추가
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={spaceGrotesk.variable}>
      <body className="font-body bg-bg-900 text-[#F1F5F9]">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
