"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, fieldClass, FormError } from "@/components/forms/fields";
import { deleteDeckV2, updateDeckV2Meta } from "@/app/decks/actions";

export default function DeckMetaForm({
  deckId,
  name,
  format,
  description,
  isPublic,
}: {
  deckId: string;
  name: string;
  format: "EDH" | "cEDH";
  description: string | null;
  isPublic: boolean;
}) {
  const [metaState, metaAction] = useActionState(updateDeckV2Meta, null);
  const [deleteState, deleteAction] = useActionState(deleteDeckV2, null);

  return (
    <div className="space-y-4">
      <form action={metaAction} className="space-y-3 rounded-xl border border-white/10 bg-card/60 p-3">
        <input type="hidden" name="deckId" value={deckId} />
        <p className="text-xs font-medium uppercase tracking-wider text-foreground/45">Deck</p>
        <FormError error={metaState?.error} />
        <Field label="Název">
          <input name="name" required maxLength={120} defaultValue={name} className={fieldClass} />
        </Field>
        <Field label="Formát">
          <select name="format" defaultValue={format} className={fieldClass}>
            <option value="EDH">EDH</option>
            <option value="cEDH">cEDH</option>
          </select>
        </Field>
        <Field label="Popis">
          <textarea
            name="description"
            maxLength={1000}
            rows={2}
            defaultValue={description ?? ""}
            className={fieldClass}
          />
        </Field>
        <label className="flex items-center gap-2 text-xs text-foreground/70">
          <input type="checkbox" name="isPublic" defaultChecked={isPublic} className="rounded border-white/20" />
          Veřejný deck
        </label>
        <SubmitButton label="Uložit údaje" className="w-full" />
      </form>

      <form action={deleteAction} className="space-y-2 rounded-xl border border-red-400/25 bg-red-400/5 p-3">
        <input type="hidden" name="deckId" value={deckId} />
        <p className="text-xs font-medium text-red-200/90">Smazat deck</p>
        <FormError error={deleteState?.error} />
        <Field label='Napiš „smazat“'>
          <input name="confirm" className={fieldClass} placeholder="smazat" autoComplete="off" />
        </Field>
        <SubmitButton
          label="Smazat natrvalo"
          pendingLabel="Mažu…"
          className="w-full bg-red-600 hover:bg-red-500"
        />
      </form>
    </div>
  );
}
