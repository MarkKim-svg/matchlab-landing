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

  // /pro/* 경로 보호: 비로그인 시 /login으로 리다이렉트
  if (!user && request.nextUrl.pathname.startsWith("/pro")) {
    const url = request.nextUrl.clone();
    const redirectTo = request.nextUrl.pathname + request.nextUrl.search;
    url.pathname = "/login";
    url.searchParams.set("redirect", redirectTo);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
