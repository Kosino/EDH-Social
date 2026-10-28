/** Event kinds + icons in `public/icons/`. */

export const EVENT_KINDS = [
  "cEDH Tournament",
  "EDH Tournament",
  "Friday Night Magic",
  "Casual Pod",
] as const;

export type EventKind = (typeof EVENT_KINDS)[number];

type EventKindMeta = {
  label: string;
  icon: string;
  chip: string;
  border: string;
  pill: string;
  dot: string;
};

export const EVENT_KIND_META: Record<EventKind, EventKindMeta> = {
  "cEDH Tournament": {
    label: "cEDH Tournament",
    icon: "/icons/cedh-tournament.jpg",
    chip: "bg-primary/20 text-primary",
    border: "border-primary text-primary hover:bg-primary/10",
    pill: "bg-primary/30 text-primary",
    dot: "bg-primary",
  },
  "EDH Tournament": {
    label: "EDH Tournament",
    icon: "/icons/edh-tournament.jpg",
    chip: "bg-accent/20 text-accent",
    border: "border-accent text-accent hover:bg-accent/10",
    pill: "bg-accent/30 text-accent",
    dot: "bg-accent",
  },
  "Friday Night Magic": {
    label: "Friday Night Magic",
    icon: "/icons/friday-night.jpg",
    chip: "bg-accent/20 text-accent",
    border: "border-accent text-accent hover:bg-accent/10",
    pill: "bg-accent/30 text-accent",
    dot: "bg-accent",
  },
  "Casual Pod": {
    label: "Casual Pod",
    icon: "/icons/casual-pod.jpg",
    chip: "bg-casual/20 text-casual",
    border: "border-casual text-casual hover:bg-casual/10",
    pill: "bg-casual/30 text-casual",
    dot: "bg-casual",
  },
}

/** Map legacy DB values from earlier Part 1 schema. */
const LEGACY_EVENT_TYPE: Record<string, EventKind> = {
  Competitive: "cEDH Tournament",
  Casual: "Casual Pod",
  Online: "Friday Night Magic",
};

export function normalizeEventKind(raw: string): EventKind | string {
  if (raw in EVENT_KIND_META) return raw as EventKind;
  return LEGACY_EVENT_TYPE[raw] ?? raw;
}

export function eventKindMeta(raw: string): EventKindMeta {
  const kind = normalizeEventKind(raw);
  if (kind in EVENT_KIND_META) {
    return EVENT_KIND_META[kind as EventKind];
  }
  return {
    label: raw,
    icon: "/icons/casual-pod.jpg",
    chip: "bg-white/10 text-foreground/80",
    border: "border-white/20 text-foreground/80 hover:bg-white/5",
    pill: "bg-white/10 text-foreground/80",
    dot: "bg-white/50",
  };
}

export function isEventKind(value: string): value is EventKind {
  return (EVENT_KINDS as readonly string[]).includes(value);
}
