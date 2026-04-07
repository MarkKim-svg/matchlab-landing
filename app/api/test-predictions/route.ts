import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.FOOTBALL_API_KEY;
  const fixtureId = "1224691";

  const res = await fetch(
    `https://v3.football.api-sports.io/predictions?fixture=${fixtureId}`,
    { headers: { "x-apisports-key": apiKey || "" } }
  );
  const data = await res.json();

  const pred = data.response?.[0];

  return NextResponse.json({
    hasResponse: !!pred,
    topKeys: pred ? Object.keys(pred) : [],
    teamsKeys: pred?.teams ? Object.keys(pred.teams) : [],
    homeKeys: pred?.teams?.home ? Object.keys(pred.teams.home) : [],
    hasHomePlayers: !!pred?.teams?.home?.players,
    homeFormation: pred?.teams?.home?.league?.formation ?? pred?.teams?.home?.formation ?? "none",
    homeStartXI: pred?.teams?.home?.players?.startXI?.slice(0, 2) ?? "no players field",
    rawHomeSample: JSON.stringify(pred?.teams?.home ?? {}).slice(0, 500),
  });
}
