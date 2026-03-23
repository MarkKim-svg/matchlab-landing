import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        borderBottom: "1px solid #222",
        background: "#0a0a0a",
      }}
    >
      <Link href="/" style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 700, textDecoration: "none" }}>
        MATCHLAB
      </Link>
      <Link
        href="/login"
        style={{
          background: "#2563eb",
          color: "#fff",
          padding: "0.5rem 1.25rem",
          borderRadius: "0.375rem",
          textDecoration: "none",
          fontSize: "0.875rem",
          fontWeight: 600,
        }}
      >
        Pro 시작하기
      </Link>
    </nav>
  );
}
