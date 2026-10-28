import { NextResponse } from "next/server";
import {
  fetchCardNameSuggestions,
  type AutocompleteMode,
} from "@/lib/deckbuilder/scryfall-autocomplete";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const modeParam = searchParams.get("mode") ?? "any";
  const mode: AutocompleteMode = modeParam === "commander" ? "commander" : "any";

  if (q.length < 2) {
    return NextResponse.json({ data: [] });
  }

  try {
    const data = await fetchCardNameSuggestions(q, mode);
    return NextResponse.json(
      { data },
      {
        headers: {
          // Short private cache — cuts repeat keystrokes hitting Scryfall.
          "Cache-Control": "private, max-age=30",
        },
      }
    );
  } catch {
    return NextResponse.json({ data: [] }, { status: 502 });
  }
}
