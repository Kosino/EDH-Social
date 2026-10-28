"use client";

import ScryfallCardInput from "@/components/deckbuilder/ScryfallCardInput";

/** Local/QA surface for Scryfall typeahead (no auth). */
export default function ScryfallAutocompletePreviewPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-10">
      <div>
        <h1 className="font-display text-2xl font-bold">Scryfall typeahead</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Same component as Taverna create/editor — via <code>/api/scryfall/autocomplete</code>.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          alert(`submit commander=${data.get("commander")} card=${data.get("cardName")}`);
        }}
        className="space-y-6"
      >
        <label className="block space-y-1.5">
          <span className="text-sm">Commander (mode=commander)</span>
          <ScryfallCardInput name="commander" mode="commander" placeholder="Tymna…" className="h-10" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm">Add card (mode=any)</span>
          <ScryfallCardInput name="cardName" placeholder="Lightning…" className="h-10" />
        </label>
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Submit form
        </button>
      </form>
    </div>
  );
}
