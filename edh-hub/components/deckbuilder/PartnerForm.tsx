"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/auth/SubmitButton";
import { FormError } from "@/components/forms/fields";
import ScryfallCardInput from "@/components/deckbuilder/ScryfallCardInput";
import { setDeckPartner } from "@/app/decks/actions";

export default function PartnerForm({
  deckId,
  partnerName,
}: {
  deckId: string;
  partnerName: string | null;
}) {
  const [state, formAction] = useActionState(setDeckPartner, null);

  return (
    <form
      action={formAction}
      className="flex w-full shrink-0 flex-wrap items-stretch gap-2 border-t border-white/10 pt-2 lg:w-auto lg:border-l lg:border-t-0 lg:pl-3 lg:pt-0"
    >
      <input type="hidden" name="deckId" value={deckId} />
      <span className="flex h-10 items-center text-xs font-medium uppercase tracking-wider text-foreground/45">
        Partner
      </span>
      <div className="min-w-[10rem] flex-1 lg:w-44 lg:flex-none">
        <ScryfallCardInput
          name="partner"
          maxLength={160}
          mode="commander"
          defaultValue={partnerName ?? ""}
          placeholder="Volitelný partner…"
          className="h-10"
        />
      </div>
      <SubmitButton
        label={partnerName ? "Uložit" : "Nastavit"}
        pendingLabel="…"
        className="h-10 shrink-0 px-3 whitespace-nowrap"
      />
      {state?.error && !state.message ? (
        <div className="basis-full">
          <FormError error={state.error} />
        </div>
      ) : null}
      {state?.message ? (
        <p className="basis-full text-xs text-casual">{state.message}</p>
      ) : null}
    </form>
  );
}
