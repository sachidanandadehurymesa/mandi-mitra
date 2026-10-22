import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createAdminSessionToken, getAdminPassword } from "@/lib/auth/admin-session";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ATTEMPTS = 10;
const attemptLog = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (attemptLog.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  attemptLog.set(key, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_ATTEMPTS;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const password = typeof (body as { password?: unknown })?.password === "string"
    ? (body as { password: string }).password
    : "";

  if (password !== getAdminPassword()) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = createAdminSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return response;
}
