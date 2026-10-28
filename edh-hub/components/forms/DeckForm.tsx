"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, fieldClass, FormError } from "@/components/forms/fields";
import { createDeck } from "@/app/create/actions";

export default function DeckForm() {
  const [state, action] = useActionState(createDeck, null);

  return (
    <form action={action} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-card p-6">
      <FormError error={state?.error} />
      <Field label="Název">
        <input name="name" required maxLength={120} className={fieldClass} />
      </Field>
      <Field label="Formát">
        <select name="format" required defaultValue="EDH" className={fieldClass}>
          <option value="EDH">EDH</option>
          <option value="cEDH">cEDH</option>
        </select>
      </Field>
      <Field label="Commander">
        <input name="commander" required maxLength={120} className={fieldClass} />
      </Field>
      <Field label="Moxfield" hint="Volitelné. Jen adresy na moxfield.com.">
        <input name="moxfieldUrl" type="url" placeholder="https://moxfield.com/decks/…" className={fieldClass} />
      </Field>
      <SubmitButton label="Uložit deck" />
    </form>
  );
}
