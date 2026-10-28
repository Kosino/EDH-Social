import { pragueLocalToUtc } from "@/lib/utils";

const FORMATS = ["EDH", "cEDH"] as const;
const EVENT_TYPES = ["Competitive", "Casual", "Online"] as const;

export type DeckFormat = (typeof FORMATS)[number];
export type EventType = (typeof EVENT_TYPES)[number];

export type PostInput = {
  title: string;
  body: string;
  excerpt: string;
  deckName: string | null;
};

export type DeckInput = {
  name: string;
  format: DeckFormat;
  commander: string;
  moxfieldUrl: string | null;
};

export type EventInput = {
  title: string;
  eventType: EventType;
  startsAt: string;
  location: string | null;
};

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function excerptFrom(body: string) {
  const flat = body.replace(/\s+/g, " ").trim();
  if (flat.length <= 180) return flat;
  return `${flat.slice(0, 177)}…`;
}

export function parsePost(formData: FormData): { ok: true; value: PostInput } | { ok: false; error: string } {
  const title = text(formData.get("title"));
  const body = text(formData.get("body"));
  const excerptField = text(formData.get("excerpt"));
  const deckName = text(formData.get("deckName"));

  if (title.length < 1 || title.length > 160) return { ok: false, error: "Nadpis musí mít 1–160 znaků." };
  if (body.length < 1 || body.length > 8000) return { ok: false, error: "Text příspěvku musí mít 1–8000 znaků." };
  if (excerptField.length > 180) return { ok: false, error: "Krátký popis může mít nejvýš 180 znaků." };
  if (deckName.length > 120) return { ok: false, error: "Název decku může mít nejvýš 120 znaků." };

  return {
    ok: true,
    value: {
      title,
      body,
      excerpt: excerptField || excerptFrom(body),
      deckName: deckName || null,
    },
  };
}

export function parseDeck(formData: FormData): { ok: true; value: DeckInput } | { ok: false; error: string } {
  const name = text(formData.get("name"));
  const format = text(formData.get("format"));
  const commander = text(formData.get("commander"));
  const moxfield = text(formData.get("moxfieldUrl"));

  if (name.length < 1 || name.length > 120) return { ok: false, error: "Název decku musí mít 1–120 znaků." };
  if (!FORMATS.includes(format as DeckFormat)) return { ok: false, error: "Vyber formát EDH nebo cEDH." };
  if (commander.length < 1 || commander.length > 120) {
    return { ok: false, error: "Jméno commandera musí mít 1–120 znaků." };
  }

  let moxfieldUrl: string | null = null;
  if (moxfield) {
    try {
      const url = new URL(moxfield);
      const host = url.hostname.toLowerCase();
      if (url.protocol !== "https:" || (host !== "moxfield.com" && host !== "www.moxfield.com")) {
        return { ok: false, error: "Odkaz na Moxfield musí začínat https://moxfield.com/." };
      }
      moxfieldUrl = url.toString();
    } catch {
      return { ok: false, error: "Odkaz na Moxfield není platná adresa." };
    }
  }

  return {
    ok: true,
    value: { name, format: format as DeckFormat, commander, moxfieldUrl },
  };
}

export function parseEvent(
  formData: FormData,
  now = Date.now()
): { ok: true; value: EventInput } | { ok: false; error: string } {
  const title = text(formData.get("title"));
  const eventType = text(formData.get("eventType"));
  const startsAtRaw = text(formData.get("startsAt"));
  const location = text(formData.get("location"));

  if (title.length < 1 || title.length > 160) return { ok: false, error: "Název eventu musí mít 1–160 znaků." };
  if (!EVENT_TYPES.includes(eventType as EventType)) return { ok: false, error: "Vyber typ eventu." };
  if (location.length > 160) return { ok: false, error: "Místo může mít nejvýš 160 znaků." };

  const startsAt = pragueLocalToUtc(startsAtRaw);
  if (!startsAt) return { ok: false, error: "Zadej datum a čas začátku." };
  if (startsAt.getTime() < now - 60_000) return { ok: false, error: "Event musí začínat v budoucnosti." };

  return {
    ok: true,
    value: {
      title,
      eventType: eventType as EventType,
      startsAt: startsAt.toISOString(),
      location: location || null,
    },
  };
}
