import "server-only";
import type { ComparisonResult, OnionQuality, QuantityUnit } from "@/types/domain";
import { DEMO_VILLAGES } from "@/lib/data/villages";
import { formatINR } from "@/lib/utils";

/**
 * AI assistant service interface.
 *
 * Hard rules (do not relax these when wiring up a real model):
 *  - The assistant NEVER invents a market price.
 *  - The assistant NEVER performs the final financial calculation — that is
 *    always lib/calc/engine.ts, and explainRanking() only narrates numbers
 *    that are already present on the ComparisonResult it is given.
 *  - Structured extraction output is always validated against our own
 *    domain types before anything downstream trusts it.
 *
 * Until an ANTHROPIC_API_KEY is configured, `getActiveAssistant()` returns
 * the rule-based MockAssistant below so the product still works end-to-end.
 */

export interface ParsedFarmerMessage {
  crop: "onion" | null;
  quantity: number | null;
  unit: QuantityUnit | null;
  quality: OnionQuality | null;
  villageId: string | null;
  villageRaw: string | null;
  missingFields: Array<"quantity" | "unit" | "quality" | "village">;
  clarifyingQuestionMr: string | null;
  clarifyingQuestionEn: string | null;
  rawMessage: string;
}

export interface AIAssistant {
  readonly name: "mock" | "claude";
  parseFarmerMessage(message: string): Promise<ParsedFarmerMessage>;
  explainRankingMr(result: ComparisonResult): Promise<string>;
}

const DEVANAGARI_DIGITS: Record<string, string> = {
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
  "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
};

function normalizeDigits(text: string): string {
  return text.replace(/[०-९]/g, (d) => DEVANAGARI_DIGITS[d] ?? d);
}

const QUALITY_KEYWORDS: Array<{ quality: OnionQuality; words: string[] }> = [
  { quality: "good", words: ["चांगला", "चांगली", "उत्तम", "good", "achha", "best"] },
  { quality: "medium", words: ["मध्यम", "medium", "average", "theek"] },
  { quality: "low", words: ["कमी", "हलका", "low", "poor"] },
];

const UNIT_KEYWORDS: Array<{ unit: QuantityUnit; words: string[] }> = [
  { unit: "bags", words: ["गोणी", "गोण्या", "bag", "bags", "goni"] },
  { unit: "quintals", words: ["क्विंटल", "क्विंटल्स", "quintal", "quintals", "qtl"] },
];

/** Rule-based, offline NLU for Marathi / Hindi / English farmer messages. */
export class MockAssistant implements AIAssistant {
  readonly name = "mock" as const;

  async parseFarmerMessage(message: string): Promise<ParsedFarmerMessage> {
    const text = normalizeDigits(message.trim());
    const lower = text.toLowerCase();

    const crop: "onion" | null =
      /कांदा|कांदे|onion|pyaj|प्याज/i.test(text) ? "onion" : null;

    const quantityMatch = text.match(/(\d+(?:\.\d+)?)/);
    const quantity = quantityMatch ? Number(quantityMatch[1]) : null;

    let unit: QuantityUnit | null = null;
    for (const { unit: u, words } of UNIT_KEYWORDS) {
      if (words.some((w) => lower.includes(w.toLowerCase()))) {
        unit = u;
        break;
      }
    }

    let quality: OnionQuality | null = null;
    for (const { quality: q, words } of QUALITY_KEYWORDS) {
      if (words.some((w) => lower.includes(w.toLowerCase()))) {
        quality = q;
        break;
      }
    }

    let villageId: string | null = null;
    let villageRaw: string | null = null;
    for (const village of DEMO_VILLAGES) {
      if (text.includes(village.nameMr) || lower.includes(village.name.toLowerCase())) {
        villageId = village.id;
        villageRaw = village.name;
        break;
      }
    }

    const missingFields: ParsedFarmerMessage["missingFields"] = [];
    if (quantity === null) missingFields.push("quantity");
    if (unit === null) missingFields.push("unit");
    if (quality === null) missingFields.push("quality");
    if (villageId === null) missingFields.push("village");

    const clarifyingQuestionMr =
      missingFields.length > 0
        ? `कृपया सांगा: ${missingFields
            .map((f) =>
              f === "quantity"
                ? "किती प्रमाण (संख्या)"
                : f === "unit"
                ? "गोणी की क्विंटल"
                : f === "quality"
                ? "कांद्याची प्रत (चांगला/मध्यम/कमी)"
                : "तुमचे गाव"
            )
            .join(", ")}?`
        : null;

    const clarifyingQuestionEn =
      missingFields.length > 0
        ? `Please share: ${missingFields
            .map((f) =>
              f === "quantity"
                ? "how much quantity"
                : f === "unit"
                ? "bags or quintals"
                : f === "quality"
                ? "onion quality (good/medium/low)"
                : "your village"
            )
            .join(", ")}?`
        : null;

    return {
      crop,
      quantity,
      unit,
      quality,
      villageId,
      villageRaw,
      missingFields,
      clarifyingQuestionMr,
      clarifyingQuestionEn,
      rawMessage: message,
    };
  }

  /**
   * Narrates an ALREADY-COMPUTED ComparisonResult in simple Marathi.
   * Every number here is read directly off `result` — nothing is recomputed
   * or guessed, so the explanation can never drift from the engine's output.
   */
  async explainRankingMr(result: ComparisonResult): Promise<string> {
    const best = result.ranked[0];
    if (!best) return "सध्या तुलना करण्यासाठी पुरेशी माहिती उपलब्ध नाही.";

    const lines = [
      `तुमच्यासाठी सर्वोत्तम पर्याय: ${best.mandiNameMr} (अंदाजे निव्वळ उत्पन्न ${formatINR(
        Math.round(best.netEarnings)
      )}).`,
      `हे अंतर ${best.distanceKm} किमी आहे आणि दर क्विंटल भाव ${formatINR(
        Math.round(best.pricePerQuintal)
      )} आहे.`,
    ];

    if (result.additionalEarningsVsNearest > 0) {
      lines.push(
        `सर्वात जवळच्या बाजारापेक्षा हे ${formatINR(
          Math.round(result.additionalEarningsVsNearest)
        )} जास्त फायद्याचे आहे, कारण वाहतूक खर्च आणि बाजार शुल्क वजा केल्यावर उरणारी रक्कम जास्त आहे.`
      );
    }

    lines.push("ही आकडेवारी अंदाजे आहे; प्रत्यक्ष विक्री किंमत वेगळी असू शकते.");

    return lines.join(" ");
  }
}

/**
 * Claude-backed assistant — NOT YET CONNECTED.
 *
 * To enable: set ANTHROPIC_API_KEY, then implement parseFarmerMessage() to
 * call the Claude API with a prompt that returns strict structured JSON
 * (crop/quantity/unit/quality/village), validated against our schema before
 * use. explainRankingMr() should similarly only be allowed to narrate the
 * numbers already present on `result`, never compute or restate different
 * ones — validate its output against `result` before showing it to a farmer.
 */
export class ClaudeAssistant implements AIAssistant {
  readonly name = "claude" as const;

  private get apiKey(): string | undefined {
    return process.env.ANTHROPIC_API_KEY;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async parseFarmerMessage(): Promise<ParsedFarmerMessage> {
    throw new Error(
      "ClaudeAssistant is not implemented yet. Configure ANTHROPIC_API_KEY and implement this method, or use getActiveAssistant() which falls back to MockAssistant."
    );
  }

  async explainRankingMr(): Promise<string> {
    throw new Error("ClaudeAssistant is not implemented yet.");
  }
}

export function getActiveAssistant(): AIAssistant {
  // ClaudeAssistant's methods are stubs (see class above) — switch this once
  // they are actually implemented and tested. Until then we always use the
  // rule-based assistant so the product never throws in front of a farmer.
  return new MockAssistant();
}
