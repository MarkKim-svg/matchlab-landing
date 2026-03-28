import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/[0.88] backdrop-blur-[12px] border-b border-ml-border px-6">
      <div className="max-w-[1120px] mx-auto flex justify-between items-center h-14">
        <Link href="/" className="font-[800] text-lg tracking-[-0.02em]">
          MATCHLAB
        </Link>
        <a
          href="#pricing"
          className="bg-ml-accent hover:bg-ml-accent-hover text-white text-[13px] font-semibold px-5 py-2 rounded-full transition-colors"
        >
          Pro 시작하기
        </a>
      </div>
    </nav>
  );
}
