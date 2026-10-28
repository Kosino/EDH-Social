/** Visible product brand. Code folder may stay `edh-hub`. */
export const BRAND_NAME = "EDH Social";
export const BRAND_TAGLINE = "MTG Commander Network";

/** Look-only topic chips for feed cards (mock language). */
export function feedTopicChip(input: { title: string; deckName: string | null }) {
  const hay = `${input.title} ${input.deckName ?? ""}`.toLowerCase();
  if (hay.includes("cedh") || hay.includes("cEDH".toLowerCase())) {
    return { label: "cEDH", className: "bg-primary/20 text-primary" };
  }
  if (input.deckName) {
    return { label: "Deck", className: "bg-accent/20 text-accent" };
  }
  return { label: "Diskuze", className: "bg-casual/20 text-casual" };
}

/** @deprecated Prefer `eventKindMeta` from `@/lib/events`. */
export { eventKindMeta as eventTypeStyle, EVENT_KIND_META as EVENT_TYPE_STYLE } from "@/lib/events";
export type { EventKind as KnownEventType } from "@/lib/events";
