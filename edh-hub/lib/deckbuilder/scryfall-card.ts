import { getScryfallImage } from "@/lib/scryfall";

export type ResolvedCard = {
  scryfallId: string | null;
  name: string;
  manaCost: string | null;
  typeLine: string | null;
  oracleText: string | null;
  colorIdentity: string[];
  imageUrl: string | null;
  isBasicLand: boolean;
  legalities: Record<string, string>;
};

const BASIC_LANDS = new Set([
  "plains",
  "island",
  "swamp",
  "mountain",
  "forest",
  "wastes",
  "snow-covered plains",
  "snow-covered island",
  "snow-covered swamp",
  "snow-covered mountain",
  "snow-covered forest",
]);

export async function resolveCardByName(query: string): Promise<ResolvedCard | null> {
  const name = query.trim();
  if (!name) return null;

  try {
    const res = await fetch(
      `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(name)}`,
      {
        next: { revalidate: 86400 },
        headers: { Accept: "application/json", "User-Agent": "EDH-Social-Taverna/0.1" },
      }
    );

    if (!res.ok) {
      // Fallback: still allow manual entry with empty metadata
      const imageUrl = await getScryfallImage(name, "normal");
      return {
        scryfallId: null,
        name,
        manaCost: null,
        typeLine: null,
        oracleText: null,
        colorIdentity: [],
        imageUrl,
        isBasicLand: BASIC_LANDS.has(name.toLowerCase()),
        legalities: {},
      };
    }

    const card = (await res.json()) as {
      id?: string;
      name?: string;
      mana_cost?: string;
      type_line?: string;
      oracle_text?: string;
      color_identity?: string[];
      image_uris?: { normal?: string; art_crop?: string };
      card_faces?: Array<{
        mana_cost?: string;
        oracle_text?: string;
        image_uris?: { normal?: string; art_crop?: string };
      }>;
      legalities?: Record<string, string>;
    };

    const typeLine = card.type_line ?? null;
    const isBasicLand =
      BASIC_LANDS.has((card.name ?? name).toLowerCase()) ||
      Boolean(typeLine?.toLowerCase().includes("basic land"));

    return {
      scryfallId: card.id ?? null,
      name: card.name ?? name,
      manaCost: card.mana_cost ?? card.card_faces?.[0]?.mana_cost ?? null,
      typeLine,
      oracleText: card.oracle_text ?? card.card_faces?.[0]?.oracle_text ?? null,
      colorIdentity: card.color_identity ?? [],
      imageUrl:
        card.image_uris?.normal ||
        card.image_uris?.art_crop ||
        card.card_faces?.[0]?.image_uris?.normal ||
        null,
      isBasicLand,
      legalities: card.legalities ?? {},
    };
  } catch {
    return {
      scryfallId: null,
      name,
      manaCost: null,
      typeLine: null,
      oracleText: null,
      colorIdentity: [],
      imageUrl: null,
      isBasicLand: BASIC_LANDS.has(name.toLowerCase()),
      legalities: {},
    };
  }
}
