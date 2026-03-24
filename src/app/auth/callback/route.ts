import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectUrl = new URL("/", request.url);

  if (!code) {
    return NextResponse.redirect(redirectUrl);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.redirect(redirectUrl);
  }

  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.exchangeCodeForSession(code);

  if (session) {
    const { data: userRow } = await supabase
      .from("users")
      .select("organization_id")
      .eq("id", session.user.id)
      .single();

    if (!userRow) {
      const orgSetupUrl = new URL("/onboarding/org-setup", request.url);
      return NextResponse.redirect(orgSetupUrl, { headers: response.headers });
    }
  }

  return response;
}
