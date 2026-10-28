"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, fieldClass, FormError } from "@/components/forms/fields";
import { createPost } from "@/app/create/actions";
import type { PostKind } from "@/lib/create/validate";

export default function PostForm({ kind = "post" }: { kind?: PostKind }) {
  const [state, action] = useActionState(createPost, null);
  const isArticle = kind === "article";

  return (
    <form action={action} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-card p-6">
      <input type="hidden" name="kind" value={kind} />
      <FormError error={state?.error} />
      <Field label="Nadpis">
        <input name="title" required maxLength={160} className={fieldClass} />
      </Field>
      <Field label={isArticle ? "Text článku" : "Text"}>
        <textarea name="body" required maxLength={8000} rows={isArticle ? 12 : 8} className={fieldClass} />
      </Field>
      <Field label="Krátký popis" hint="Volitelné. Když ho necháš prázdný, vezme se začátek textu.">
        <input name="excerpt" maxLength={180} className={fieldClass} />
      </Field>
      {!isArticle ? (
        <Field label="Deck" hint="Volitelné.">
          <input name="deckName" maxLength={120} className={fieldClass} />
        </Field>
      ) : null}
      <SubmitButton label={isArticle ? "Publikovat článek" : "Publikovat"} />
    </form>
  );
}
