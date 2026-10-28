"use client";

import { useActionState } from "react";
import Link from "next/link";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, fieldClass, FormError } from "@/components/forms/fields";
import { importDecklist } from "@/app/decks/actions";

export type ImportDeckOption = { id: string; name: string };

export default function ImportDecklistForm({
  deckId,
  decks,
  showTitle = true,
}: {
  /** Fixed target deck (editor). */
  deckId?: string;
  /** Choose among decks (dedicated import page). */
  decks?: ImportDeckOption[];
  showTitle?: boolean;
}) {
  const [state, formAction] = useActionState(importDecklist, null);
  const fixedId = deckId ?? null;
  const options = decks ?? [];

  if (!fixedId && options.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-card/60 p-5 text-sm text-foreground/70">
        Nejdřív{" "}
        <Link href="/decks/new" className="text-primary hover:underline">
          vytvoř deck
        </Link>
        , pak sem naimportuješ seznam karet.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-white/10 bg-card p-4">
      {fixedId ? <input type="hidden" name="deckId" value={fixedId} /> : null}
      {showTitle ? (
        <h3 className="font-display text-sm font-semibold">Importovat seznam</h3>
      ) : null}
      <p className="text-xs text-foreground/45">
        Vlož textový export (Arena / Moxfield). Sekce <code className="text-foreground/60">Commander</code>,{" "}
        <code className="text-foreground/60">Deck</code>, <code className="text-foreground/60">Sideboard</code>.
      </p>
      <FormError error={state?.error || undefined} />
      {state?.message ? (
        <p className="rounded-lg border border-casual/40 bg-casual/10 px-3 py-2 text-sm text-casual">
          {state.message}
        </p>
      ) : null}
      {!fixedId ? (
        <Field label="Cílový deck">
          <select name="deckId" required defaultValue={options[0]?.id} className={fieldClass}>
            {options.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
      <Field label="Decklist">
        <textarea
          name="decklist"
          required
          rows={10}
          placeholder={`Commander\n1 Selvala, Heart of the Wilds\nDeck\n1 Sol Ring\n1 Cultivate\n…`}
          className={fieldClass}
        />
      </Field>
      <label className="flex items-center gap-2 text-xs text-foreground/70">
        <input type="checkbox" name="replaceMain" className="rounded border-white/20" />
        Nahradit mainboard (smazat stávající main karty před importem)
      </label>
      <SubmitButton label="Importovat" />
    </form>
  );
}
