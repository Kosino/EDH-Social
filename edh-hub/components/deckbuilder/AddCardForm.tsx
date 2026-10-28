"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, fieldClass, FormError } from "@/components/forms/fields";
import ScryfallCardInput from "@/components/deckbuilder/ScryfallCardInput";
import { addCardToDeck } from "@/app/decks/actions";

export default function AddCardForm({ deckId }: { deckId: string }) {
  const [state, formAction] = useActionState(addCardToDeck, null);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-white/10 bg-card p-4">
      <input type="hidden" name="deckId" value={deckId} />
      <h3 className="font-display text-sm font-semibold">Přidat kartu</h3>
      <FormError error={state?.error} />
      <Field label="Jméno karty" hint="Živé hledání přes Scryfall.">
        <ScryfallCardInput name="cardName" required placeholder="Sol Ring" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Počet">
          <input
            name="quantity"
            type="number"
            min={1}
            max={99}
            defaultValue={1}
            className={fieldClass}
          />
        </Field>
        <Field label="Zóna">
          <select name="board" defaultValue="main" className={fieldClass}>
            <option value="main">Main</option>
            <option value="commander">Commander</option>
            <option value="sideboard">Sideboard</option>
          </select>
        </Field>
      </div>
      <SubmitButton label="Přidat" />
    </form>
  );
}
