"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, fieldClass, FormError } from "@/components/forms/fields";
import { createPost } from "@/app/create/actions";

export default function PostForm() {
  const [state, action] = useActionState(createPost, null);

  return (
    <form action={action} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-card p-6">
      <FormError error={state?.error} />
      <Field label="Nadpis">
        <input name="title" required maxLength={160} className={fieldClass} />
      </Field>
      <Field label="Text">
        <textarea name="body" required maxLength={8000} rows={8} className={fieldClass} />
      </Field>
      <Field label="Krátký popis" hint="Volitelné. Když ho necháš prázdný, vezme se začátek textu.">
        <input name="excerpt" maxLength={180} className={fieldClass} />
      </Field>
      <Field label="Deck" hint="Volitelné.">
        <input name="deckName" maxLength={120} className={fieldClass} />
      </Field>
      <SubmitButton label="Publikovat" />
    </form>
  );
}
