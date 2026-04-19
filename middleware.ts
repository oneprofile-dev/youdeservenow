import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Only set if not already set (avoid overwriting on every request)
  if (!request.cookies.has("x-country")) {
    const country = (request.headers.get("x-vercel-ip-country") ?? "US").toUpperCase();
    response.cookies.set("x-country", country, {
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "lax",
      httpOnly: false, // must be readable by client JS
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon|robots|sitemap).*)"],
};
