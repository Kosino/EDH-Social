"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export default function SubmitButton({
  label,
  className,
  pendingLabel = "Posílám…",
}: {
  label: string;
  className?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-60",
        className ?? "w-full"
      )}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
