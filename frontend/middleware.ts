import { NextResponse } from "next/server";

// Stage-1 pass-through. Replaced in stage 2 with JWT verification against Spring backend.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/candidate/:path*"],
};
