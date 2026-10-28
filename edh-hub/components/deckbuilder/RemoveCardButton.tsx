"use client";

import { useActionState } from "react";
import { removeCardFromDeck } from "@/app/decks/actions";

export default function RemoveCardButton({ deckId, cardId }: { deckId: string; cardId: string }) {
  const [state, formAction] = useActionState(removeCardFromDeck, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="deckId" value={deckId} />
      <input type="hidden" name="cardId" value={cardId} />
      <button
        type="submit"
        className="text-xs text-red-300/80 hover:text-red-300"
        title={state?.error ?? "Odebrat"}
      >
        Odebrat
      </button>
    </form>
  );
}
