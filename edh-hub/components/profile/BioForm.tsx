"use client";

import { useActionState } from "react";
import { updateBio } from "@/app/profile/actions";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, fieldClass, FormError } from "@/components/forms/fields";
import { MAX_BIO_LENGTH } from "@/lib/profile/bio";

export default function BioForm({ bio }: { bio: string | null }) {
  const [state, action] = useActionState(updateBio, null);

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
      <div className="sm:max-w-48">
        <SubmitButton label="Uložit popis" />
      </div>
    </form>
  );
}
