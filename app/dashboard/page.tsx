import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import AuthTabBar from "@/components/AuthTabBar";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "적중률 대시보드 · MATCHLAB",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard");

  return (
    <div className="min-h-screen" style={{ background: "#0F172A" }}>
      <Navbar />
      <AuthTabBar />
      <main className="max-w-3xl mx-auto pb-20 md:pb-0">
        <DashboardClient />
      </main>
      <Footer />
    </div>
  );
}
