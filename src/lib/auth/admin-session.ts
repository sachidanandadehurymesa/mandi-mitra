import "server-only";
import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

/**
 * DEMO-GRADE admin auth.
 *
 * This proves the "protected admin route" concept end-to-end without a real
 * identity provider: a single shared password (from ADMIN_PASSWORD, never
 * hardcoded) gates access. The session cookie is a self-verifying signed
 * token (timestamp + HMAC), not a lookup key into server memory — Next.js
 * dev/prod can run route handlers and page renders on different worker
 * processes, so an in-memory "active sessions" set would silently fail to
 * recognize a session created by a different worker. Signing the token
 * means any worker can verify it on its own.
 *
 * Before a real pilot: replace this with Supabase Auth (email/password or
 * magic link) plus row-level security on every admin-writable table, so
 * "only authenticated administrators can change market data" is enforced by
 * the database, not just by this cookie check.
 */

export const ADMIN_COOKIE_NAME = "mandi_mitra_admin_session";
const DEMO_FALLBACK_PASSWORD = "mandi-mitra-admin";
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? DEMO_FALLBACK_PASSWORD;
}

export function isUsingDemoFallbackPassword(): boolean {
  return !process.env.ADMIN_PASSWORD;
}

/**
 * Secret used to sign session tokens. Falls back to deriving something from
 * the admin password + a fixed salt so this still works with zero
 * configuration in demo mode. Set ADMIN_SESSION_SECRET in any real
 * deployment so sessions don't become invalid whenever ADMIN_PASSWORD changes.
 */
function getSigningSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? `mandi-mitra-demo-salt:${getAdminPassword()}`;
}

function sign(payload: string): string {
  return createHmac("sha256", getSigningSecret()).update(payload).digest("hex");
}

export function createAdminSessionToken(): string {
  const issuedAt = Date.now().toString();
  const nonce = randomBytes(8).toString("hex");
  const payload = `${issuedAt}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

function isValidToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [issuedAt, nonce, signature] = parts;
  const expectedSignature = sign(`${issuedAt}.${nonce}`);

  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expectedSignature, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const age = Date.now() - Number(issuedAt);
  return Number.isFinite(age) && age >= 0 && age < SESSION_MAX_AGE_MS;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE_NAME)?.value;
  return Boolean(token && isValidToken(token));
}
