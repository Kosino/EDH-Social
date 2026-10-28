"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, fieldClass, FormError } from "@/components/forms/fields";
import { importDecklist } from "@/app/decks/actions";

export default function ImportDecklistForm({ deckId }: { deckId: string }) {
  const [state, formAction] = useActionState(importDecklist, null);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-white/10 bg-card p-4">
      <input type="hidden" name="deckId" value={deckId} />
      <h3 className="font-display text-sm font-semibold">Importovat seznam</h3>
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
      <Field label="Decklist">
        <textarea
          name="decklist"
          required
          rows={8}
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
