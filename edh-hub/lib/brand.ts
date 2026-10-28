/** Visible product brand. Code folder may stay `edh-hub`. */
export const BRAND_NAME = "EDH Social";
export const BRAND_TAGLINE = "Commander komunita";

export const EVENT_TYPE_STYLE = {
  Competitive: {
    label: "Competitive",
    chip: "bg-primary/20 text-primary",
    border: "border-primary text-primary hover:bg-primary/10",
    pill: "bg-primary/25 text-primary",
    dot: "bg-primary",
  },
  Casual: {
    label: "Casual",
    chip: "bg-casual/20 text-casual",
    border: "border-casual text-casual hover:bg-casual/10",
    pill: "bg-casual/25 text-casual",
    dot: "bg-casual",
  },
  Online: {
    label: "Online",
    chip: "bg-accent/20 text-accent",
    border: "border-accent text-accent hover:bg-accent/10",
    pill: "bg-accent/25 text-accent",
    dot: "bg-accent",
  },
} as const;

export type KnownEventType = keyof typeof EVENT_TYPE_STYLE;

export function eventTypeStyle(eventType: string) {
  if (eventType in EVENT_TYPE_STYLE) {
    return EVENT_TYPE_STYLE[eventType as KnownEventType];
  }
  return {
    label: eventType,
    chip: "bg-white/10 text-foreground/80",
    border: "border-white/20 text-foreground/80 hover:bg-white/5",
    pill: "bg-white/10 text-foreground/80",
    dot: "bg-white/50",
  };
}
