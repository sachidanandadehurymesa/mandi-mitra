"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingCta() {
  return (
    <Link href="/compare">
      <Button size="lg" className="gap-2">
        Find Best Mandi <ArrowRight size={18} />
      </Button>
    </Link>
  );
}

export function LandingSecondaryCta() {
  return (
    <a href="#how-it-works">
      <Button size="lg" variant="secondary">
        See How It Works
      </Button>
    </a>
  );
}
