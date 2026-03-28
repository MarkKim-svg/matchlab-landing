export default async function ProDashboardPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  return (
    <div className="p-16 text-center">
      <h1>유료 콘텐츠 페이지</h1>
      <p>날짜: {date}</p>
      <p>Sprint 2에서 Pro 대시보드 구현 예정</p>
    </div>
  );
}
