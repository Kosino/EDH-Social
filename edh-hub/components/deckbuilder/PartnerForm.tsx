"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, FormError } from "@/components/forms/fields";
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
    <form action={formAction} className="space-y-3 rounded-xl border border-white/10 bg-card/80 p-4">
      <input type="hidden" name="deckId" value={deckId} />
      <p className="text-xs font-medium uppercase tracking-wider text-foreground/45">Partner</p>
      <FormError error={state?.error && !state.message ? state.error : undefined} />
      {state?.message ? <p className="text-xs text-casual">{state.message}</p> : null}
      <Field label="Druhý commander" hint="Živé hledání. Prázdné = odebrat partnera.">
        <ScryfallCardInput
          name="partner"
          maxLength={160}
          mode="commander"
          defaultValue={partnerName ?? ""}
          placeholder="např. Thrasios, Triton Hero"
        />
      </Field>
      <SubmitButton label={partnerName ? "Uložit partnera" : "Přidat partnera"} />
    </form>
  );
}
