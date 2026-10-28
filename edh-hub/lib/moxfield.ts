import { getScryfallImage } from "@/lib/scryfall";

export type MoxfieldCommanderPreview = {
  name: string;
  imageUrl: string | null;
  deckName: string | null;
  deckUrl: string | null;
};

function moxfieldUsernameFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host !== "moxfield.com" && host !== "www.moxfield.com") return null;
    const m = u.pathname.match(/^\/users\/([A-Za-z0-9_-]+)\/?$/);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

type DeckListItem = {
  name?: string;
  publicUrl?: string;
  publicId?: string;
  mainCardId?: string;
  mainCard?: {
    name?: string;
    image_uris?: { normal?: string; large?: string; art_crop?: string };
    card_faces?: Array<{ image_uris?: { normal?: string; large?: string; art_crop?: string } }>;
  };
};

function imageFromCard(card: DeckListItem["mainCard"]): string | null {
  if (!card) return null;
  return (
    card.image_uris?.normal ||
    card.image_uris?.large ||
    card.image_uris?.art_crop ||
    card.card_faces?.[0]?.image_uris?.normal ||
    card.card_faces?.[0]?.image_uris?.art_crop ||
    null
  );
}

async function fetchMoxfieldJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (compatible; EDH-Social/0.2; +https://edh-social.vercel.app)",
        Referer: "https://www.moxfield.com/",
        Origin: "https://www.moxfield.com",
      },
    });
    if (!res.ok) return null;
    const ctype = res.headers.get("content-type") || "";
    if (!ctype.includes("application/json")) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function resolveMainCard(
  mainCardId: string | undefined
): Promise<{ name: string; imageUrl: string | null } | null> {
  if (!mainCardId) return null;
  const data = (await fetchMoxfieldJson(
    `https://api2.moxfield.com/v2/cards/details/${encodeURIComponent(mainCardId)}`
  )) as { name?: string; image_uris?: { normal?: string; art_crop?: string } } | null;
  if (!data?.name) return null;
  const imageUrl =
    data.image_uris?.normal ||
    data.image_uris?.art_crop ||
    (await getScryfallImage(data.name, "normal"));
  return { name: data.name, imageUrl };
}

/**
 * Prefers live Moxfield user decks (commander = deck main card).
 * Falls back to local EDH Social commander names → Scryfall art.
 * (Moxfield API is often Cloudflare-blocked from some hosts; Scryfall still fills art.)
 */
export async function getMoxfieldCommanderPreviews(opts: {
  moxfieldUserUrl: string | null;
  localCommanders: string[];
}): Promise<MoxfieldCommanderPreview[]> {
  const previews: MoxfieldCommanderPreview[] = [];
  const seen = new Set<string>();

  const push = (item: MoxfieldCommanderPreview) => {
    const key = item.name.toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    previews.push(item);
  };

  const username = opts.moxfieldUserUrl ? moxfieldUsernameFromUrl(opts.moxfieldUserUrl) : null;
  if (username) {
    const list = (await fetchMoxfieldJson(
      `https://api2.moxfield.com/v2/users/${encodeURIComponent(username)}/decks?pageNumber=1&pageSize=18`
    )) as { data?: DeckListItem[] } | null;

    for (const deck of list?.data ?? []) {
      const deckUrl =
        deck.publicUrl ||
        (deck.publicId ? `https://moxfield.com/decks/${deck.publicId}` : null);
      let name = deck.mainCard?.name ?? null;
      let imageUrl = imageFromCard(deck.mainCard);

      if (!name && deck.mainCardId) {
        const details = await resolveMainCard(deck.mainCardId);
        if (details) {
          name = details.name;
          imageUrl = details.imageUrl;
        }
      }

      if (!name) continue;
      if (!imageUrl) imageUrl = await getScryfallImage(name, "normal");
      push({
        name,
        imageUrl,
        deckName: deck.name ?? null,
        deckUrl,
      });
      if (previews.length >= 6) break;
    }
  }

  if (previews.length > 0) return previews.slice(0, 6);

  // Fallback: local EDH Social commanders (caller only invokes when Moxfield URL is set)
  for (const commander of opts.localCommanders) {
    const imageUrl = await getScryfallImage(commander, "normal");
    push({
      name: commander,
      imageUrl,
      deckName: null,
      deckUrl: opts.moxfieldUserUrl,
    });
    if (previews.length >= 6) break;
  }

  return previews;
}
