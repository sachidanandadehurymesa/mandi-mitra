import "server-only";
import type { ComparisonInput, ComparisonResult } from "@/types/domain";
import { getActiveAssistant } from "@/lib/ai/assistant";
import { runComparison } from "@/lib/services/comparison-service";
import { CalculationValidationError } from "@/lib/calc/engine";

/**
 * WhatsApp-ready architecture.
 *
 * NONE OF THIS IS CONNECTED TO WHATSAPP YET. There is no webhook route, no
 * Meta/WhatsApp Business Cloud API credentials, and `sendWhatsAppMessage`
 * below is a stub that logs instead of sending. Do not describe WhatsApp
 * messaging as working until:
 *   1. A webhook route is added (e.g. app/api/whatsapp/webhook/route.ts)
 *      verified against Meta's signature scheme.
 *   2. WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID are configured.
 *   3. sendWhatsAppMessage() actually calls the Cloud API and this has been
 *      tested against a real WhatsApp Business account.
 *
 * The pieces below (parse -> fetch prices -> calculate -> format -> send)
 * are written as small, reusable, testable services on purpose, so wiring
 * up the webhook later is just plumbing, not a rewrite.
 */

export interface InboundFarmerMessage {
  fromPhoneNumber: string;
  text: string;
  receivedAt: string;
}

export interface OutboundFarmerMessage {
  toPhoneNumber: string;
  text: string;
}

/** Step 1: receive. In production this is populated by the webhook handler. */
export function receiveMessage(fromPhoneNumber: string, text: string): InboundFarmerMessage {
  return { fromPhoneNumber, text, receivedAt: new Date().toISOString() };
}

/** Step 2: parse. Delegates to the AI assistant — never invents values. */
export async function parseInboundMessage(message: InboundFarmerMessage) {
  const assistant = getActiveAssistant();
  return assistant.parseFarmerMessage(message.text);
}

/** Step 3 + 4: fetch prices and calculate/rank. Delegates to the same service the web UI uses. */
export async function calculateForFarmer(input: ComparisonInput): Promise<ComparisonResult | { error: string }> {
  try {
    return await runComparison(input);
  } catch (err) {
    if (err instanceof CalculationValidationError) {
      return { error: err.issues.join(" ") };
    }
    return { error: "Could not calculate mandi options right now." };
  }
}

/** Step 5: format a Marathi reply. Numbers come straight from the ComparisonResult. */
export async function formatMarathiReply(result: ComparisonResult): Promise<string> {
  const assistant = getActiveAssistant();
  return assistant.explainRankingMr(result);
}

/**
 * Step 6: send. STUB ONLY — logs instead of calling the WhatsApp Cloud API.
 * Replace the body with a fetch() to
 * https://graph.facebook.com/v19.0/{WHATSAPP_PHONE_NUMBER_ID}/messages
 * using WHATSAPP_ACCESS_TOKEN once credentials are available, and remove
 * this comment once it has been tested end-to-end.
 */
export async function sendWhatsAppMessage(message: OutboundFarmerMessage): Promise<{ sent: boolean }> {
  const configured = Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
  if (!configured) {
    console.warn(
      "[whatsapp] Not configured — would have sent to",
      message.toPhoneNumber,
      ":",
      message.text
    );
    return { sent: false };
  }
  // TODO: implement the real Cloud API call once credentials are configured.
  return { sent: false };
}
