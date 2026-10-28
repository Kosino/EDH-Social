"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, fieldClass, FormError } from "@/components/forms/fields";
import ScryfallCardInput from "@/components/deckbuilder/ScryfallCardInput";
import { createDeck } from "@/app/decks/actions";

export default function TavernaDeckForm() {
  const [state, formAction] = useActionState(createDeck, null);

  return (
    <form action={formAction} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-card p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-accent">Taverna u Kosa</p>
      <FormError error={state?.error} />
      <Field label="Název">
        <input name="name" required maxLength={120} className={fieldClass} placeholder="např. Selvala Stompy" />
      </Field>
      <Field label="Formát">
        <select name="format" required defaultValue="EDH" className={fieldClass}>
          <option value="EDH">EDH</option>
          <option value="cEDH">cEDH</option>
        </select>
      </Field>
      <Field label="Commander" hint="Živé hledání commanderů na Scryfallu.">
        <ScryfallCardInput
          name="commander"
          required
          maxLength={160}
          mode="commander"
          placeholder="např. Tymna the Weaver"
        />
      </Field>
      <Field
        label="Partner"
        hint="Volitelné. Druhý commander (Partner / Partner with / Friends forever)."
      >
        <ScryfallCardInput
          name="partner"
          maxLength={160}
          mode="commander"
          placeholder="např. Thrasios, Triton Hero"
        />
      </Field>
      <Field label="Popis" hint="Volitelné.">
        <textarea name="description" maxLength={1000} rows={3} className={fieldClass} />
      </Field>
      <SubmitButton label="Vytvořit v Taverně" />
    </form>
  );
}
