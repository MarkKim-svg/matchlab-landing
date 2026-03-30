"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get("redirect") || "/";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

  const supabase = createClient();

  function getCallbackUrl() {
    return `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`;
  }

  async function handleOAuth(provider: "kakao" | "google") {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: getCallbackUrl() },
    });
    if (error) setError(getErrorMessage(error.message));
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(getErrorMessage(error.message));
      } else {
        router.push(redirect);
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: getCallbackUrl() },
      });
      if (error) {
        setError(getErrorMessage(error.message));
      } else {
        setSignupDone(true);
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-dvh bg-bg-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        {/* 로고 */}
        <div className="flex flex-col items-center mb-8 gap-2">
          <BeakerLogo />
          <h1 className="text-3xl font-bold font-display tracking-[-1.5px] text-bg-100">
            MATCHLAB
          </h1>
          <p className="text-bg-200 text-sm">AI 축구 경기 분석</p>
        </div>

        {/* 카드 */}
        <div className="bg-bg-800 rounded-2xl p-6 border border-bg-700">
          {signupDone ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📬</div>
              <p className="text-lg font-medium text-bg-50 mb-2">
                인증 메일을 보냈습니다
              </p>
              <p className="text-sm text-bg-200">
                <span className="text-emerald-400">{email}</span>
                에서 메일을 확인해주세요.
              </p>
              <button
                onClick={() => {
                  setSignupDone(false);
                  setMode("login");
                }}
                className="mt-6 text-sm text-emerald-400 underline underline-offset-4"
              >
                로그인으로 돌아가기
              </button>
            </div>
          ) : (
            <>
              {/* 소셜 로그인 */}
              <button
                onClick={() => handleOAuth("kakao")}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl
                           bg-[#FEE500] text-[#191919] font-medium text-[15px]
                           hover:brightness-95 transition-all cursor-pointer"
              >
                <KakaoIcon />
                카카오로 시작하기
              </button>

              <button
                onClick={() => handleOAuth("google")}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl mt-3
                           bg-white text-[#191919] font-medium text-[15px]
                           hover:brightness-95 transition-all cursor-pointer"
              >
                <GoogleIcon />
                Google로 시작하기
              </button>

              {/* 구분선 */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-bg-700" />
                <span className="text-xs text-bg-200">또는</span>
                <div className="flex-1 h-px bg-bg-700" />
              </div>

              {/* 이메일 폼 */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl bg-bg-900 border border-bg-700
                             text-bg-50 text-sm placeholder:text-bg-200
                             focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <input
                  type="password"
                  placeholder="비밀번호 (6자 이상)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-12 px-4 rounded-xl bg-bg-900 border border-bg-700
                             text-bg-50 text-sm placeholder:text-bg-200
                             focus:outline-none focus:border-emerald-500 transition-colors"
                />

                {error && (
                  <p className="text-error text-sm px-1">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl font-medium text-[15px] transition-all cursor-pointer
                             bg-emerald-500 text-white hover:bg-emerald-400
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "처리 중..."
                    : mode === "login"
                      ? "로그인"
                      : "가입하기"}
                </button>
              </form>

              {/* 모드 토글 */}
              <p className="text-center text-sm text-bg-200 mt-5">
                {mode === "login" ? (
                  <>
                    계정이 없으신가요?{" "}
                    <button
                      onClick={() => {
                        setMode("signup");
                        setError("");
                      }}
                      className="text-emerald-400 underline underline-offset-4 cursor-pointer"
                    >
                      가입하기
                    </button>
                  </>
                ) : (
                  <>
                    이미 계정이 있으신가요?{" "}
                    <button
                      onClick={() => {
                        setMode("login");
                        setError("");
                      }}
                      className="text-emerald-400 underline underline-offset-4 cursor-pointer"
                    >
                      로그인
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- 에러 메시지 한글 변환 ---------- */
function getErrorMessage(msg: string): string {
  if (msg.includes("Invalid login credentials"))
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  if (msg.includes("Email not confirmed"))
    return "이메일 인증이 완료되지 않았습니다. 메일을 확인해주세요.";
  if (msg.includes("User already registered"))
    return "이미 가입된 이메일입니다.";
  if (msg.includes("Password should be at least"))
    return "비밀번호는 6자 이상이어야 합니다.";
  if (msg.includes("Email rate limit exceeded"))
    return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
  if (msg.includes("Signups not allowed"))
    return "현재 가입이 비활성화되어 있습니다.";
  return msg;
}

/* ---------- 로고 ---------- */
function BeakerLogo() {
  return (
    <svg viewBox="4 2 66 76" className="w-10 h-11" fill="none">
      <path d="M10,10 L10,66 Q10,74 18,74 L54,74 Q62,74 62,66 L62,10" stroke="#10B981" strokeWidth="2.2" strokeLinejoin="round"/>
      <line x1="8" y1="10" x2="64" y2="10" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M62,10 L66,6" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="25" cy="61" r="12" fill="#10B981"/><circle cx="49" cy="61" r="11" fill="#10B981" opacity="0.55"/><circle cx="36" cy="43" r="8" fill="#10B981" opacity="0.28"/>
    </svg>
  );
}

/* ---------- 아이콘 ---------- */
function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M9 1.5C4.86 1.5 1.5 4.14 1.5 7.38c0 2.08 1.39 3.9 3.48 4.94l-.89 3.26c-.08.28.25.5.49.34l3.9-2.58c.16.01.33.02.52.02 4.14 0 7.5-2.64 7.5-5.88S13.14 1.5 9 1.5Z"
        fill="#191919"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
