"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const BeakerIcon = () => (
  <svg viewBox="4 2 66 76" className="w-6 h-7" fill="none">
    <path d="M10,10 L10,66 Q10,74 18,74 L54,74 Q62,74 62,66 L62,10" stroke="#10B981" strokeWidth="2.2" strokeLinejoin="round"/>
    <line x1="8" y1="10" x2="64" y2="10" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M62,10 L66,6" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round"/>
    <circle cx="25" cy="61" r="12" fill="#10B981"/>
    <circle cx="49" cy="61" r="11" fill="#10B981" opacity="0.55"/>
    <circle cx="36" cy="43" r="8" fill="#10B981" opacity="0.28"/>
  </svg>
);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 px-6 transition-all duration-300 ${
      scrolled ? "bg-[#0F172A]/95 backdrop-blur-lg border-b border-[#334155]" : "bg-transparent border-b border-transparent"
    }`}>
      <div className="max-w-[1120px] mx-auto flex justify-between items-center h-14">
        <Link href="/" className="flex items-center gap-2">
          <BeakerIcon />
          <span className="font-outfit font-[800] text-lg tracking-[-1px] text-[#F1F5F9]">MATCHLAB</span>
        </Link>
        <a href="#pricing" className="bg-emerald-500 hover:bg-emerald-700 text-white text-[13px] font-bold px-6 py-2 rounded-lg transition-colors">
          Pro 시작하기
        </a>
      </div>
    </nav>
  );
}
