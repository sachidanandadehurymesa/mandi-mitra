import { NextRequest, NextResponse } from "next/server";
import { comparisonFormSchema } from "@/lib/validation/schemas";
import { runComparison } from "@/lib/services/comparison-service";
import { CalculationValidationError } from "@/lib/calc/engine";

// Simple in-memory rate limiting for this public endpoint (per server instance).
// Production deployments should replace this with a shared store (e.g. Redis)
// behind a proxy/CDN rate limiter.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const requestLog = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  requestLog.set(key, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = comparisonFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form.", issues: parsed.error.issues.map((i) => i.message) },
      { status: 400 }
    );
  }

  try {
    const result = await runComparison(parsed.data);
    return NextResponse.json({ result });
  } catch (err) {
    if (err instanceof CalculationValidationError) {
      return NextResponse.json({ error: err.message, issues: err.issues }, { status: 422 });
    }
    console.error("Comparison failed", err);
    return NextResponse.json(
      { error: "Something went wrong while calculating mandi options. Please try again." },
      { status: 500 }
    );
  }
}
