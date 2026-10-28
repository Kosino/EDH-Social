/**
 * Scryfall typeahead helpers (server-safe).
 * Uses /cards/autocomplete (all cards) or /cards/search + name regex + is:commander.
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
    // Regex on name avoids full-text hits (oracle / flavor) like Photon for "tym".
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
    const names: string[] = [];
    for (const card of body.data ?? []) {
      const n = card.name?.trim();
      if (n && n.toLowerCase().includes(needle)) names.push(n);
    }
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

/** Browser-safe wrapper — same-origin proxy (proper UA, no CORS). */
export async function fetchCardNameSuggestionsViaApi(
  query: string,
  mode: AutocompleteMode = "any",
  signal?: AbortSignal
): Promise<string[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const params = new URLSearchParams({ q, mode });
  const res = await fetch(`/api/scryfall/autocomplete?${params}`, { signal });
  if (!res.ok) return [];
  const body = (await res.json()) as { data?: string[] };
  return (body.data ?? []).slice(0, 12);
}
