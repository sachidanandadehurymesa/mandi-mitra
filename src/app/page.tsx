import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  MapPinned,
  MessageSquareText,
  Smartphone,
  Truck,
  Wallet,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingCta, LandingSecondaryCta } from "@/components/landing/landing-cta";
import { SampleComparison } from "@/components/landing/sample-comparison";
import { runComparison } from "@/lib/services/comparison-service";
import type { ComparisonResult } from "@/types/domain";

export default async function HomePage() {
  let sample: ComparisonResult | null = null;
  try {
    sample = await runComparison({
      crop: "onion",
      villageId: "lasalgaon",
      quantity: 40,
      unit: "bags",
      avgWeightPerBagKg: 50,
      quality: "good",
      transportType: "tempo",
      transportRatePerKm: 25,
    });
  } catch {
    sample = null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Benefits />
        {sample && <SampleComparison result={sample} />}
        <TransportExplainer />
        <DataExplainer />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-(--color-green-light)/60 to-(--color-bg) py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <Badge variant="demo">DEMO DATA USED THROUGHOUT THIS PREVIEW</Badge>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-(--color-forest-dark) sm:text-5xl">
            Sell Smarter. Earn More.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-(--color-text-muted)">
            Find the best mandi for your onions with AI-powered price comparisons. Know what you
            will earn before you leave your village.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LandingCta />
            <LandingSecondaryCta />
          </div>
          <div className="mt-8 flex flex-wrap gap-5 text-sm text-(--color-text-muted)">
            <span className="flex items-center gap-2">
              <Smartphone size={18} className="text-(--color-forest)" /> Works on basic smartphones
            </span>
            <span className="flex items-center gap-2">
              <MessageSquareText size={18} className="text-(--color-forest)" /> English + मराठी
            </span>
          </div>
        </div>
        <HeroPreviewCard />
      </div>
    </section>
  );
}

function HeroPreviewCard() {
  return (
    <Card className="mx-auto w-full max-w-md shadow-lg">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-(--color-text-muted)">Preview: best mandi today</p>
          <Badge variant="demo">DEMO</Badge>
        </div>
        <div>
          <p className="text-sm text-(--color-text-muted)">Niphad APMC</p>
          <p className="text-3xl font-extrabold text-(--color-forest)">₹16,580</p>
          <p className="text-sm text-(--color-text-muted)">expected net earnings for 40 bags</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-(--color-green-light) p-3">
            <p className="text-(--color-text-muted)">Distance</p>
            <p className="font-semibold text-(--color-forest-dark)">10 km</p>
          </div>
          <div className="rounded-xl bg-(--color-green-light) p-3">
            <p className="text-(--color-text-muted)">vs. nearest mandi</p>
            <p className="font-semibold text-(--color-forest-dark)">+₹1,240</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: MapPinned,
      title: "Tell us about your crop",
      body: "Enter your village, quantity, quality, and how you plan to transport your onions.",
    },
    {
      icon: BarChart3,
      title: "We compare mandis for you",
      body: "We check prices, transport cost and mandi charges for every nearby market.",
    },
    {
      icon: Wallet,
      title: "See your best option",
      body: "Get the top 3 mandis ranked by expected net earnings, not just the highest price.",
    },
  ];
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-center text-3xl font-bold text-(--color-forest-dark)">How it works</h2>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map((step, i) => (
          <Card key={step.title} className="h-full">
            <CardContent className="p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-forest) text-white">
                <step.icon size={20} />
              </div>
              <p className="mt-4 text-sm font-semibold text-(--color-forest)">Step {i + 1}</p>
              <h3 className="mt-1 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm text-(--color-text-muted)">{step.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Benefits() {
  const benefits = [
    "No more calling five traders to compare prices.",
    "See net earnings after transport and mandi charges — not just the headline price.",
    "Works in Marathi, built for basic smartphones.",
    "Every price shown has a source and a date.",
  ];
  return (
    <section className="bg-(--color-forest) py-16 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-3xl font-bold">Why farmers use Mandi Mitra</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {benefits.map((b) => (
            <div key={b} className="flex items-start gap-3 rounded-xl bg-white/10 p-4">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-(--color-gold)" />
              <p>{b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TransportExplainer() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-gold)/30 text-(--color-forest-dark)">
            <Truck size={22} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-(--color-forest-dark)">
            How transport and mandi charges work
          </h2>
          <p className="mt-3 text-(--color-text-muted)">
            We estimate round-trip transport cost using the distance to each mandi and your rate
            per km. Mandi charges include commission, handling and cess, each configured per
            market so nothing is counted twice.
          </p>
        </div>
        <Card>
          <CardContent className="space-y-3 p-6 text-sm">
            <Row label="Expected sale value" value="Quantity (quintals) × price per quintal" />
            <Row label="− Transport cost" value="Round-trip distance × rate per km" />
            <Row label="− Mandi commission" value="% of sale value" />
            <Row label="− Handling + cess" value="Flat charges per mandi" />
            <div className="h-px bg-(--color-border)" />
            <Row label="= Net earnings" value="What you actually take home" strong />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? "font-bold text-(--color-forest)" : ""}`}>
      <span>{label}</span>
      <span className="text-right text-(--color-text-muted)">{value}</span>
    </div>
  );
}

function DataExplainer() {
  return (
    <section className="bg-(--color-green-light)/50 py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-bold text-(--color-forest-dark)">Where our prices come from</h2>
        <p className="mt-3 text-(--color-text-muted)">
          Mandi Mitra is built to use official Agmarknet market price data. Until that is
          connected for your region, the figures you see are clearly marked demo data so you
          always know what is real and what is illustrative.
        </p>
        <p className="mt-6 rounded-xl border border-(--color-gold)/40 bg-white p-4 text-sm text-(--color-text-muted)">
          Estimates depend on the price and cost data available and may not match the price you
          are actually offered at the mandi. Always confirm the final price with the trader before
          selling.
        </p>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
      <h2 className="text-3xl font-bold text-(--color-forest-dark)">Ready to compare mandis?</h2>
      <p className="mt-2 text-(--color-text-muted)">
        It takes less than a minute to see your best options.
      </p>
      <Link
        href="/compare"
        className="focus-ring mt-6 inline-flex h-14 items-center gap-2 rounded-xl bg-(--color-forest) px-8 text-lg font-semibold text-white hover:bg-(--color-forest-dark)"
      >
        Find Best Mandi <ArrowRight size={20} />
      </Link>
    </section>
  );
}
