export const KAKAO_CHANNEL_URL = "https://pf.kakao.com/_sThZX";
export const BLOG_URL = "https://blog.naver.com/matchlab13";
export const INSTAGRAM_URL = "https://www.instagram.com/matchlab_official_";

export const PLANS = {
  free: { name: "Free", price: 0 },
  pro_monthly: { name: "Pro 월간", price: 14900, label: "월 14,900원" },
  pro_annual: { name: "Pro 연간", price: 119000, label: "연 119,000원", discount: "33%" },
} as const;

export const EARLYBIRD_PRICE = 9900;
export const BETMAN_URL = "https://www.betman.co.kr";
export const GAMBLING_HELPLINE = "1336";
export const SUPPORT_PHONE = "010-6481-8265"; // TODO: 070 발급 후 교체
export const SUPPORT_EMAIL = "minkuikim@gmail.com";

export const LEAGUE_CONFIG: Record<string, { logo: string; color: string }> = {
  프리미어리그: { logo: "https://media.api-sports.io/football/leagues/39.png", color: "#3D195B" },
  라리가: { logo: "https://media.api-sports.io/football/leagues/140.png", color: "#FF4B44" },
  "세리에A": { logo: "https://media.api-sports.io/football/leagues/135.png", color: "#024494" },
  분데스리가: { logo: "https://media.api-sports.io/football/leagues/78.png", color: "#D20515" },
  리그1: { logo: "https://media.api-sports.io/football/leagues/61.png", color: "#091C3E" },
  챔피언스리그: { logo: "https://media.api-sports.io/football/leagues/2.png", color: "#0D1541" },
  유로파리그: { logo: "https://media.api-sports.io/football/leagues/3.png", color: "#F37B20" },
  컨퍼런스리그: { logo: "https://media.api-sports.io/football/leagues/848.png", color: "#1DB954" },
  에레디비시: { logo: "https://media.api-sports.io/football/leagues/88.png", color: "#E4002B" },
  FA컵: { logo: "https://media.api-sports.io/football/leagues/45.png", color: "#C8102E" },
  코파이탈리아: { logo: "https://media.api-sports.io/football/leagues/137.png", color: "#024494" },
  DFB포칼: { logo: "https://media.api-sports.io/football/leagues/81.png", color: "#D20515" },
  코파델레이: { logo: "https://media.api-sports.io/football/leagues/143.png", color: "#FF4B44" },
  쿠프드프랑스: { logo: "https://media.api-sports.io/football/leagues/66.png", color: "#091C3E" },
};
