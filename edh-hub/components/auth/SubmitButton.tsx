"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-60"
    >
      {pending ? "Posílám…" : label}
    </button>
  );
}
