"use client";

import { useActionState, useState } from "react";
import { updateBio } from "@/app/profile/actions";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, fieldClass, FormError } from "@/components/forms/fields";
import { MAX_BIO_LENGTH } from "@/lib/profile/bio";

export default function BioForm({ bio }: { bio: string | null }) {
  const [open, setOpen] = useState(!bio);
  const [state, action] = useActionState(updateBio, null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 rounded-lg border border-primary px-3 py-1.5 text-sm text-primary transition hover:bg-primary/10"
      >
        Upravit profil
      </button>
    );
  }

  return (
    <form action={action} className="mt-4 max-w-xl space-y-3">
      <FormError error={state?.error} />
      <Field label="Popis" hint="Prázdný popis se na profilu ukáže jako „Zatím bez popisu.“">
        <textarea
          name="bio"
          defaultValue={bio ?? ""}
          maxLength={MAX_BIO_LENGTH}
          rows={4}
          className={fieldClass}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <div className="sm:max-w-48">
          <SubmitButton label="Uložit popis" />
        </div>
        {bio ? (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-sm text-foreground/60 hover:text-foreground"
          >
            Zrušit
          </button>
        ) : null}
      </div>
    </form>
  );
}
