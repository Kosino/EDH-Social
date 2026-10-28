"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/auth/SubmitButton";
import EventKindIcon from "@/components/events/EventKindIcon";
import { Field, fieldClass, FormError } from "@/components/forms/fields";
import { createEvent } from "@/app/create/actions";
import { EVENT_KINDS } from "@/lib/events";

const LOCATION_SUGGESTIONS = ["Most", "Bílina", "Praha", "Online", "Discord"];

export default function EventForm() {
  const [state, action] = useActionState(createEvent, null);

  return (
    <form action={action} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-card p-6">
      <FormError error={state?.error} />
      <Field label="Název">
        <input name="title" required maxLength={160} className={fieldClass} />
      </Field>
      <Field label="Typ" hint="Ikona se bere podle typu eventu.">
        <select name="eventType" required defaultValue="Casual Pod" className={fieldClass}>
          {EVENT_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>
        <div className="mt-3 flex flex-wrap gap-3">
          {EVENT_KINDS.map((kind) => (
            <div key={kind} className="flex items-center gap-2 text-xs text-foreground/60">
              <EventKindIcon eventType={kind} className="h-8 w-8" />
              <span>{kind}</span>
            </div>
          ))}
        </div>
      </Field>
      <Field label="Začátek" hint="Čas je v Europe/Prague.">
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
      <Field label="Popis" hint="Volitelné. Např. Swiss + Top Cut, precons welcome…">
        <textarea name="description" maxLength={500} rows={3} className={fieldClass} />
      </Field>
      <SubmitButton label="Vytvořit event" />
    </form>
  );
}
