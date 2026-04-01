import Link from "next/link";

export default function GreetingSection({ userName, plan }: { userName: string; plan: string }) {
  const isPro = plan === "pro";

  return (
    <section className="px-4 pt-5 pb-3">
      <Link href="/mypage" className="inline-flex items-center gap-2">
        <span className="text-[20px] font-bold text-[#F5F5F5]">
          👋 안녕하세요, <span className="text-emerald-500">{userName}</span>님
        </span>
      </Link>
      <div className="mt-2">
        {isPro ? (
          <span
            className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #92400e, #b45309)",
              color: "#FBBF24",
              border: "1px solid #d97706",
            }}
          >
            ⭐ PRO
          </span>
        ) : (
          <span
            className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-xl"
            style={{
              background: "#262626",
              color: "#a3a3a3",
              border: "1px solid #404040",
            }}
          >
            FREE
          </span>
        )}
      </div>
    </section>
  );
}
