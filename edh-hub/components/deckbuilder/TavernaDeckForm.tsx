"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, fieldClass, FormError } from "@/components/forms/fields";
import ScryfallCardInput from "@/components/deckbuilder/ScryfallCardInput";
import { createDeck } from "@/app/decks/actions";

export default function TavernaDeckForm() {
  const [state, formAction] = useActionState(createDeck, null);

  return (
    <form action={formAction} className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-card/80 p-4 sm:p-5">
      <FormError error={state?.error} />
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
        <Field label="Název">
          <input
            name="name"
            required
            maxLength={120}
            className={fieldClass}
            placeholder="např. Tymna / Thrasios"
          />
        </Field>
        <Field label="Formát">
          <select name="format" required defaultValue="EDH" className={fieldClass}>
            <option value="EDH">EDH</option>
            <option value="cEDH">cEDH</option>
          </select>
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Commander" hint="Scryfall autocomplete">
          <ScryfallCardInput
            name="commander"
            required
            maxLength={160}
            mode="commander"
            placeholder="Tymna the Weaver"
          />
        </Field>
        <Field label="Partner" hint="Volitelné">
          <ScryfallCardInput
            name="partner"
            maxLength={160}
            mode="commander"
            placeholder="Thrasios, Triton Hero"
          />
        </Field>
      </div>
      <Field label="Popis" hint="Volitelné">
        <textarea name="description" maxLength={1000} rows={2} className={fieldClass} />
      </Field>
      <div className="flex justify-end">
        <SubmitButton label="Vytvořit deck" className="w-auto px-5" />
      </div>
    </form>
  );
}
