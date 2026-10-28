"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, fieldClass, FormError } from "@/components/forms/fields";
import { createPost, updatePost } from "@/app/create/actions";
import type { PostKind } from "@/lib/create/validate";

export type PostFormValues = {
  title?: string;
  body?: string;
  excerpt?: string;
  deckName?: string | null;
};

export default function PostForm({
  kind = "post",
  mode = "create",
  postId,
  defaults,
}: {
  kind?: PostKind;
  mode?: "create" | "edit";
  postId?: string;
  defaults?: PostFormValues;
}) {
  const action = mode === "edit" ? updatePost : createPost;
  const [state, formAction] = useActionState(action, null);
  const isArticle = kind === "article";

  return (
    <form action={formAction} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-card p-6">
      <input type="hidden" name="kind" value={kind} />
      {mode === "edit" && postId ? <input type="hidden" name="postId" value={postId} /> : null}
      <FormError error={state?.error} />
      <Field label="Nadpis">
        <input
          name="title"
          required
          maxLength={160}
          defaultValue={defaults?.title ?? ""}
          className={fieldClass}
        />
      </Field>
      <Field label={isArticle ? "Text článku" : "Text"}>
        <textarea
          name="body"
          required
          maxLength={8000}
          rows={isArticle ? 12 : 8}
          defaultValue={defaults?.body ?? ""}
          className={fieldClass}
        />
      </Field>
      <Field label="Krátký popis" hint="Volitelné. Když ho necháš prázdný, vezme se začátek textu.">
        <input
          name="excerpt"
          maxLength={180}
          defaultValue={defaults?.excerpt ?? ""}
          className={fieldClass}
        />
      </Field>
      {!isArticle ? (
        <Field label="Deck" hint="Volitelné.">
          <input
            name="deckName"
            maxLength={120}
            defaultValue={defaults?.deckName ?? ""}
            className={fieldClass}
          />
        </Field>
      ) : null}
      <SubmitButton
        label={
          mode === "edit"
            ? isArticle
              ? "Uložit článek"
              : "Uložit příspěvek"
            : isArticle
              ? "Publikovat článek"
              : "Publikovat"
        }
      />
    </form>
  );
}
