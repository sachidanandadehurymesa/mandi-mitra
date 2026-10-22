import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/auth/admin-session";

// The session token is a self-verifying signed value (see admin-session.ts),
// not a server-side lookup, so logout just clears the cookie — there is no
// server-side session record to revoke in this demo-grade auth.
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
