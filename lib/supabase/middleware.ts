import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 세션 갱신 (토큰 리프레시)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // /home 분기: 로그인 → 앱 홈, 비로그인 → 랜딩
  if (pathname === "/home" && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // "/" 분기: 로그인 사용자 → /home으로 리다이렉트 (landing=true 쿼리 시 예외)
  if (pathname === "/" && user && !request.nextUrl.searchParams.has("landing")) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // 보호 경로: 비로그인 시 /login으로 리다이렉트
  const isProtected =
    pathname.startsWith("/pro") ||
    pathname.startsWith("/mypage") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/standings") ||
    pathname.startsWith("/teams") ||
    pathname.startsWith("/team/") ||
    pathname.startsWith("/player/");
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    const redirectTo = pathname + request.nextUrl.search;
    url.pathname = "/login";
    url.searchParams.set("redirect", redirectTo);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
