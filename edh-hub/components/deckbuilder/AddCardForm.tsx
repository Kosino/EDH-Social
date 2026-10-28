"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/auth/SubmitButton";
import { fieldClass, FormError } from "@/components/forms/fields";
import ScryfallCardInput from "@/components/deckbuilder/ScryfallCardInput";
import { addCardToDeck } from "@/app/decks/actions";

export default function AddCardForm({ deckId }: { deckId: string }) {
  const [state, formAction] = useActionState(addCardToDeck, null);

  return (
    <form action={formAction} className="min-w-0 flex-1">
      <input type="hidden" name="deckId" value={deckId} />
      <input type="hidden" name="quantity" value="1" />
      <FormError error={state?.error} />
      <div className="flex flex-wrap items-stretch gap-2 sm:flex-nowrap">
        <div className="min-w-0 flex-1">
          <ScryfallCardInput
            name="cardName"
            required
            placeholder="Najít a přidat kartu…"
            className="h-10"
          />
        </div>
        <select
          name="board"
          defaultValue="main"
          aria-label="Zóna"
          className={`${fieldClass} h-10 w-auto shrink-0 sm:w-36`}
        >
          <option value="main">Main</option>
          <option value="commander">Commander</option>
          <option value="sideboard">Sideboard</option>
        </select>
        <SubmitButton
          label="Přidat"
          pendingLabel="…"
          className="h-10 shrink-0 px-5 whitespace-nowrap"
        />
      </div>
    </form>
  );
}
