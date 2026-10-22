"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function AdminLoginForm({ demoPassword }: { demoPassword?: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Incorrect password.");
        setSubmitting(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the server.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-sm px-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-forest) text-white">
            <Lock size={20} />
          </div>
          <h1 className="mt-4 text-xl font-bold">Admin sign in</h1>
          <p className="mt-1 text-sm text-(--color-text-muted)">
            Protected area for managing mandis, prices, and charges.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-(--color-danger-bg) p-3 text-sm text-(--color-danger)">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <div>
              <Label htmlFor="password">Admin password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          {demoPassword && (
            <p className="mt-4 rounded-lg bg-(--color-gold)/15 p-3 text-xs text-(--color-text-muted)">
              Demo mode: no ADMIN_PASSWORD is configured, so the fallback demo password is{" "}
              <code className="font-mono font-semibold">{demoPassword}</code>. Set ADMIN_PASSWORD
              in your environment before a real pilot.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
