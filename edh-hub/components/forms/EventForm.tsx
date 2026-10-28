"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, fieldClass, FormError } from "@/components/forms/fields";
import { createEvent } from "@/app/create/actions";

const LOCATION_SUGGESTIONS = ["Most", "Bílina", "Praha", "Online", "Discord"];

export default function EventForm() {
  const [state, action] = useActionState(createEvent, null);

  return (
    <form action={action} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-card p-6">
      <FormError error={state?.error} />
      <Field label="Název">
        <input name="title" required maxLength={160} className={fieldClass} />
      </Field>
      <Field label="Typ" hint="Competitive = turnaj, Casual = stůl, Online = remote.">
        <select name="eventType" required defaultValue="Casual" className={fieldClass}>
          <option value="Casual">Casual</option>
          <option value="Competitive">Competitive</option>
          <option value="Online">Online</option>
        </select>
      </Field>
      <Field label="Začátek" hint="Čas je v Europe/Prague (ne „Prague calendar“ — jen časová zóna).">
        <input name="startsAt" type="datetime-local" required className={fieldClass} />
      </Field>
      <Field label="Místo" hint="Volitelné. Tip: Most, Bílina, Praha, Online, Discord.">
        <input name="location" list="event-locations" maxLength={160} className={fieldClass} />
        <datalist id="event-locations">
          {LOCATION_SUGGESTIONS.map((place) => (
            <option key={place} value={place} />
          ))}
        </datalist>
      </Field>
      <SubmitButton label="Vytvořit event" />
    </form>
  );
}
