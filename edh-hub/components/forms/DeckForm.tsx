"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, fieldClass, FormError } from "@/components/forms/fields";
import { createDeck, updateDeck } from "@/app/create/actions";

export type DeckFormValues = {
  name?: string;
  format?: string;
  commander?: string;
  moxfieldUrl?: string | null;
};

export default function DeckForm({
  mode = "create",
  deckId,
  defaults,
}: {
  mode?: "create" | "edit";
  deckId?: string;
  defaults?: DeckFormValues;
}) {
  const action = mode === "edit" ? updateDeck : createDeck;
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-card p-6">
      {mode === "edit" && deckId ? <input type="hidden" name="deckId" value={deckId} /> : null}
      <FormError error={state?.error} />
      <Field label="Název">
        <input name="name" required maxLength={120} defaultValue={defaults?.name ?? ""} className={fieldClass} />
      </Field>
      <Field label="Formát">
        <select name="format" required defaultValue={defaults?.format ?? "EDH"} className={fieldClass}>
          <option value="EDH">EDH</option>
          <option value="cEDH">cEDH</option>
        </select>
      </Field>
      <Field label="Commander">
        <input
          name="commander"
          required
          maxLength={120}
          defaultValue={defaults?.commander ?? ""}
          className={fieldClass}
        />
      </Field>
      <Field label="Moxfield" hint="Volitelné. Jen adresy na moxfield.com.">
        <input
          name="moxfieldUrl"
          type="url"
          placeholder="https://moxfield.com/decks/…"
          defaultValue={defaults?.moxfieldUrl ?? ""}
          className={fieldClass}
        />
      </Field>
      <SubmitButton label={mode === "edit" ? "Uložit změny" : "Uložit deck"} />
    </form>
  );
}
