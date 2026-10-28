"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, fieldClass, FormError } from "@/components/forms/fields";
import { createEvent } from "@/app/create/actions";

export default function EventForm() {
  const [state, action] = useActionState(createEvent, null);

  return (
    <form action={action} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-card p-6">
      <FormError error={state?.error} />
      <Field label="Název">
        <input name="title" required maxLength={160} className={fieldClass} />
      </Field>
      <Field label="Typ">
        <select name="eventType" required defaultValue="Casual" className={fieldClass}>
          <option value="Casual">Casual</option>
          <option value="Competitive">Competitive</option>
          <option value="Online">Online</option>
        </select>
      </Field>
      <Field label="Začátek" hint="Čas je v Praze.">
        <input name="startsAt" type="datetime-local" required className={fieldClass} />
      </Field>
      <Field label="Místo" hint="Volitelné.">
        <input name="location" maxLength={160} className={fieldClass} />
      </Field>
      <SubmitButton label="Vytvořit event" />
    </form>
  );
}
