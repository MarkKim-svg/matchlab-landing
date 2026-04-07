import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import AuthTabBar from "@/components/AuthTabBar";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, plan")
    .eq("id", user.id)
    .single();

  const userName =
    profile?.nickname ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "사용자";

  const plan: string = profile?.plan || "free";

  return (
    <div className="min-h-screen" style={{ background: "#0F172A" }}>
      <Navbar />
      <AuthTabBar />
      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-20 md:pb-0">
        <HomeClient userName={userName} plan={plan} />
      </main>
      <Footer />
    </div>
  );
}
