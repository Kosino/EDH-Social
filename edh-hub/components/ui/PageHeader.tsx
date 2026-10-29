import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared page title block — brand kicker optional, one headline + support line. */
export default function PageHeader({
  kicker,
  title,
  description,
  actions,
  className,
}: {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-7 flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="max-w-2xl">
        {kicker ? <p className="page-kicker mb-2">{kicker}</p> : null}
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-[2rem]">{title}</h1>
        {description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/55">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
