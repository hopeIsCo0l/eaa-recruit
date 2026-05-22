import { NextRequest, NextResponse } from "next/server";

const ROLE_HOME: Record<string, string> = {
  candidate: "/candidate",
  recruiter: "/dashboard",
  admin: "/admin",
  super_admin: "/admin",
};

type JwtPayload = { sub?: string; userId?: number; role?: string; exp?: number };

function decodeJwt(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("eaa_jwt")?.value;

  if (!token) {
    const login = req.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const payload = decodeJwt(token);
  if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
    const login = req.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", pathname);
    const res = NextResponse.redirect(login);
    res.cookies.delete("eaa_jwt");
    return res;
  }

  const role = (payload.role ?? "").toLowerCase();
  const home = ROLE_HOME[role] ?? "/candidate";

  if (pathname.startsWith("/admin") && role !== "admin" && role !== "super_admin") {
    return NextResponse.redirect(new URL(home, req.url));
  }
  if (pathname.startsWith("/dashboard") && role !== "recruiter") {
    return NextResponse.redirect(new URL(home, req.url));
  }
  if (pathname.startsWith("/candidate") && role !== "candidate") {
    return NextResponse.redirect(new URL(home, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/candidate/:path*"],
};
