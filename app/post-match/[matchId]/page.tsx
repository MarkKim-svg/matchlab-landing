import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPostMatchByFixtureId, splitContentByVisualMarkers } from "@/lib/post-match";

export const revalidate = 300;

interface Props {
  params: Promise<{ matchId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { matchId } = await params;
  const data = await getPostMatchByFixtureId(matchId);
  if (!data || data.status !== "published") {
    return { title: "MATCHLAB — 경기 후 분석" };
  }
  return {
    title: `${data.hookTitle} | MATCHLAB AI`,
    description: data.tacticalAnalysis.slice(0, 150),
    openGraph: {
      title: data.hookTitle,
      description: data.tacticalAnalysis.slice(0, 150),
      images: data.visualUrl ? [{ url: data.visualUrl, width: 960, height: 480 }] : [],
    },
  };
}

function PendingState({ status }: { status: string }) {
  const labels: Record<string, string> = {
    pending: "분석 대기 중",
    collecting: "데이터 수집 중",
    analyzing: "AI 분석 중",
    failed: "분석 실패",
  };
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-32 text-center">
        <p className="text-sm uppercase tracking-widest text-neutral-500">MATCHLAB AI</p>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900">{labels[status] ?? "준비 중"}</h1>
        <p className="mt-4 text-neutral-600">
          경기 종료 후 약 2시간 이내 발행됩니다.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          홈으로 돌아가기 →
        </Link>
      </div>
    </main>
  );
}

function AiReasonBox({ reason }: { reason: string }) {
  return (
    <aside className="my-8 border-l-4 border-emerald-500 bg-neutral-50 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
        AI 추론 근거
      </p>
      <p className="mt-2 text-[15px] leading-relaxed text-neutral-800">{reason}</p>
    </aside>
  );
}

function KeyStatBoard({ keyStat }: { keyStat: { label: string; value: string } }) {
  return (
    <div className="my-6 border border-neutral-200 px-5 py-4">
      <p className="text-xs uppercase tracking-wider text-neutral-500">핵심 지표</p>
      <p className="mt-1 text-2xl font-bold text-neutral-900">{keyStat.value}</p>
      <p className="text-sm text-neutral-600">{keyStat.label}</p>
    </div>
  );
}

function PredictionBadge({
  predicted,
  actual,
  hit,
}: {
  predicted: string;
  actual: string;
  hit: boolean | undefined;
}) {
  const hitText = hit === true ? "AI 적중" : hit === false ? "AI 미적중" : "판정 대기";
  return (
    <div className="my-6 grid grid-cols-3 gap-4 border border-neutral-200">
      <div className="px-4 py-3">
        <p className="text-xs uppercase tracking-wider text-neutral-500">AI 예측</p>
        <p className="mt-1 text-base font-semibold text-neutral-900">{predicted || "—"}</p>
      </div>
      <div className="px-4 py-3 border-l border-neutral-200">
        <p className="text-xs uppercase tracking-wider text-neutral-500">실제 결과</p>
        <p className="mt-1 text-base font-semibold text-neutral-900">{actual || "—"}</p>
      </div>
      <div className="px-4 py-3 border-l border-neutral-200">
        <p className="text-xs uppercase tracking-wider text-neutral-500">판정</p>
        <p className="mt-1 text-base font-semibold text-neutral-900">{hitText}</p>
      </div>
    </div>
  );
}

function ProGate({ matchId }: { matchId: string }) {
  return (
    <section className="my-10 border border-neutral-900 bg-neutral-900 text-white px-6 py-8">
      <p className="text-xs uppercase tracking-widest text-emerald-400">Pro 딥다이브</p>
      <h3 className="mt-2 text-xl font-bold">선수별 영향도 + AI 전술 시뮬레이션</h3>
      <p className="mt-3 text-sm text-neutral-300">
        평점·xG·키패스·듀얼 성공률 가중 합산 TOP 3와 카운터팩추얼 A/B 시나리오는 Pro 구독자에게만
        공개됩니다.
      </p>
      <Link
        href={`/pricing?ref=postmatch&fixture=${matchId}`}
        className="mt-5 inline-block bg-emerald-500 hover:bg-emerald-400 text-neutral-900 font-semibold px-5 py-2.5 text-sm"
      >
        Pro 9,900원/월 구독하기
      </Link>
    </section>
  );
}

function ContentBody({
  content,
  visualUrl,
  match,
}: {
  content: string;
  visualUrl: string | null;
  match: string;
}) {
  const segments = splitContentByVisualMarkers(content);
  if (segments.length === 0) {
    return <p className="text-neutral-700 leading-[1.85]">{content}</p>;
  }
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.kind === "text") {
          return seg.text.split(/\n\n+/).map((para, j) => (
            <p key={`${i}-${j}`} className="my-4 text-[16px] leading-[1.85] text-neutral-800">
              {para}
            </p>
          ));
        }
        if (visualUrl) {
          return (
            <figure key={`v-${i}`} className="my-8">
              <Image
                src={visualUrl}
                alt={`${match} ${seg.visualType}`}
                width={960}
                height={480}
                className="w-full h-auto border border-neutral-200"
                unoptimized
              />
            </figure>
          );
        }
        return null;
      })}
    </>
  );
}

export default async function PostMatchPage({ params }: Props) {
  const { matchId } = await params;
  const data = await getPostMatchByFixtureId(matchId);

  if (!data) notFound();
  if (data.status !== "published") return <PendingState status={data.status} />;

  const pva = data.predictedVsActual;
  const reason = pva?.reason_short ?? "";

  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-2xl mx-auto px-6 py-12 md:py-16">
        <header className="border-b border-neutral-200 pb-6">
          <p className="text-xs uppercase tracking-widest text-neutral-500">
            {data.league} · 경기 후 분석
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
            {data.hookTitle}
          </h1>
          <p className="mt-3 text-sm text-neutral-600">{data.match}</p>
          <p className="mt-1 text-xs text-neutral-500">
            MATCHLAB AI · {data.publishedAt ? new Date(data.publishedAt).toLocaleString("ko-KR") : ""}
          </p>
        </header>

        {pva && (
          <PredictionBadge
            predicted={pva.prediction_label ?? ""}
            actual={pva.actual_label ?? ""}
            hit={pva.hit}
          />
        )}

        {data.keyStat && <KeyStatBoard keyStat={data.keyStat} />}

        <ContentBody content={data.content5dan} visualUrl={data.visualUrl} match={data.match} />

        {reason && <AiReasonBox reason={reason} />}

        {data.tacticalKeywords.length > 0 && (
          <div className="my-6 flex flex-wrap gap-2">
            {data.tacticalKeywords.map((k) => (
              <span
                key={k}
                className="text-xs border border-neutral-300 text-neutral-700 px-2.5 py-1"
              >
                {k}
              </span>
            ))}
          </div>
        )}

        <ProGate matchId={data.fixtureId} />

        <footer className="mt-12 border-t border-neutral-200 pt-6 text-xs text-neutral-500 leading-relaxed">
          <p>
            본 콘텐츠는 AI 분석 매거진이며 베팅 권유가 아닙니다. 합법 베팅:{" "}
            <a href="https://www.betman.co.kr" className="underline">
              betman.co.kr
            </a>
            . 도박 문제 상담: 1336.
          </p>
        </footer>
      </article>
    </main>
  );
}
