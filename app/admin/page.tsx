import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";

interface Profile {
  id: string;
  nickname: string | null;
  email: string | null;
  plan: string | null;
  role: string | null;
  created_at: string | null;
}

async function togglePlan(formData: FormData) {
  "use server";

  const userId = formData.get("userId") as string;
  const newPlan = formData.get("newPlan") as string;

  if (!userId || !["free", "pro"].includes(newPlan)) return;

  const supabase = await createClient();

  // Re-check admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") return;

  await supabase
    .from("profiles")
    .update({ plan: newPlan })
    .eq("id", userId);

  revalidatePath("/admin");
}

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") notFound();

  // Fetch all users
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nickname, email, plan, role, created_at")
    .order("created_at", { ascending: false });

  const users: Profile[] = profiles ?? [];
  const totalCount = users.length;
  const freeCount = users.filter(u => !u.plan || u.plan === "free").length;
  const proCount = users.filter(u => u.plan === "pro").length;

  return (
    <div className="min-h-screen" style={{ background: "#0F172A" }}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-1">🔧 관리자 대시보드</h1>
          <p className="text-sm text-[#64748B]">{user.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl p-4 text-center" style={{ background: "#1E293B", border: "1px solid #334155" }}>
            <div className="text-2xl font-bold text-[#F1F5F9] font-display">{totalCount}</div>
            <div className="text-xs text-[#94A3B8] mt-1">총 유저</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: "#1E293B", border: "1px solid #334155" }}>
            <div className="text-2xl font-bold text-[#94A3B8] font-display">{freeCount}</div>
            <div className="text-xs text-[#94A3B8] mt-1">Free</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: "#1E293B", border: "1px solid #334155" }}>
            <div className="text-2xl font-bold text-[#FBBF24] font-display">{proCount}</div>
            <div className="text-xs text-[#94A3B8] mt-1">Pro</div>
          </div>
        </div>

        {/* User table */}
        <div className="rounded-xl overflow-hidden" style={{ background: "#1E293B", border: "1px solid #334155" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "#334155" }}>
                  <th className="text-left px-4 py-3 text-[#94A3B8] font-medium">이름</th>
                  <th className="text-left px-4 py-3 text-[#94A3B8] font-medium">이메일</th>
                  <th className="text-left px-4 py-3 text-[#94A3B8] font-medium">가입일</th>
                  <th className="text-left px-4 py-3 text-[#94A3B8] font-medium">Plan</th>
                  <th className="text-left px-4 py-3 text-[#94A3B8] font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-[#94A3B8] font-medium">액션</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const plan = u.plan || "free";
                  const isPro = plan === "pro";
                  const dateStr = u.created_at
                    ? new Date(u.created_at).toLocaleDateString("ko-KR")
                    : "-";

                  return (
                    <tr key={u.id} className="border-b last:border-b-0" style={{ borderColor: "#334155" }}>
                      <td className="px-4 py-3 text-[#F1F5F9] font-medium whitespace-nowrap">
                        {u.nickname || "-"}
                      </td>
                      <td className="px-4 py-3 text-[#94A3B8] whitespace-nowrap">
                        {u.email || "-"}
                      </td>
                      <td className="px-4 py-3 text-[#64748B] whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="inline-block text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            color: isPro ? "#FBBF24" : "#a3a3a3",
                            background: isPro ? "rgba(251,191,36,0.15)" : "rgba(163,163,163,0.1)",
                          }}
                        >
                          {isPro ? "PRO" : "FREE"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#64748B] whitespace-nowrap">
                        {u.role || "user"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <form action={togglePlan}>
                          <input type="hidden" name="userId" value={u.id} />
                          <input type="hidden" name="newPlan" value={isPro ? "free" : "pro"} />
                          <button
                            type="submit"
                            className="text-xs font-medium px-3 py-1.5 rounded-lg transition cursor-pointer min-h-[32px]"
                            style={{
                              background: isPro ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
                              color: isPro ? "#EF4444" : "#10B981",
                              border: isPro ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(16,185,129,0.3)",
                            }}
                          >
                            {isPro ? "Free 전환" : "Pro 전환"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
