export type ScryfallImageKind = "art_crop" | "normal";

type ScryfallCard = {
  name?: string;
  image_uris?: { normal?: string; art_crop?: string };
  card_faces?: Array<{ image_uris?: { normal?: string; art_crop?: string } }>;
};

function pickImage(card: ScryfallCard, prefer: ScryfallImageKind): string | null {
  const uris = card.image_uris || card.card_faces?.[0]?.image_uris;
  if (!uris) return null;
  if (prefer === "art_crop") {
    return uris.art_crop || uris.normal || null;
  }
  return uris.normal || uris.art_crop || null;
}

/**
 * Resolve a commander/card name to a Scryfall image URL.
 * Prefers art_crop for tile backgrounds; falls back to normal card image.
 */
export async function getScryfallImage(
  cardName: string,
  prefer: ScryfallImageKind = "art_crop"
): Promise<string | null> {
  const name = cardName.trim();
  if (!name) return null;

  const headers = { Accept: "application/json", "User-Agent": "EDH-Social/0.2" };
  const revalidate = { next: { revalidate: 86400 } as const };

  try {
    const named = await fetch(
      `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(name)}`,
      { ...revalidate, headers }
    );
    if (named.ok) {
      const card = (await named.json()) as ScryfallCard;
      const img = pickImage(card, prefer);
      if (img) return img;
    }

    // Ambiguous short names (e.g. "Atraxa") → prefer legendary commanders
    const search = await fetch(
      `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
        `${name} is:commander`
      )}&unique=cards&order=released&dir=desc`,
      { ...revalidate, headers }
    );
    if (!search.ok) return null;
    const list = (await search.json()) as { data?: ScryfallCard[] };
    const first = list.data?.[0];
    return first ? pickImage(first, prefer) : null;
  } catch {
    return null;
  }
}

/** Dedupe concurrent lookups for the same commander on one page. */
export async function getScryfallImagesByName(
  names: string[],
  prefer: ScryfallImageKind = "art_crop"
): Promise<Map<string, string | null>> {
  const unique = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
  const entries = await Promise.all(
    unique.map(async (name) => [name, await getScryfallImage(name, prefer)] as const)
  );
  return new Map(entries);
}
