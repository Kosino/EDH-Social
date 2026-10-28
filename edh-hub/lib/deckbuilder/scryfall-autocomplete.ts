/**
 * Client-safe Scryfall typeahead helpers.
 * Uses /cards/autocomplete (all cards) or /cards/search + is:commander.
 */

const HEADERS = {
  Accept: "application/json",
  "User-Agent": "EDH-Social-Taverna/0.2",
};

export type AutocompleteMode = "any" | "commander";

export async function fetchCardNameSuggestions(
  query: string,
  mode: AutocompleteMode = "any",
  signal?: AbortSignal
): Promise<string[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  if (mode === "commander") {
    // Regex on name avoids full-text hits (oracle / flavor).
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const url =
      `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
        `name:/${escaped}/i is:commander`
      )}` + `&unique=cards&order=name&dir=asc`;
    const res = await fetch(url, { headers: HEADERS, signal });
    if (res.status === 404) return [];
    if (!res.ok) return [];
    const body = (await res.json()) as { data?: Array<{ name?: string }> };
    const needle = q.toLowerCase();
    const names = (body.data ?? [])
      .map((c) => c.name?.trim())
      .filter((n): n is string => Boolean(n) && n.toLowerCase().includes(needle));
    return Array.from(new Set(names)).slice(0, 12);
  }

  const res = await fetch(
    `https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(q)}`,
    { headers: HEADERS, signal }
  );
  if (!res.ok) return [];
  const body = (await res.json()) as { data?: string[] };
  return (body.data ?? []).slice(0, 12);
}
