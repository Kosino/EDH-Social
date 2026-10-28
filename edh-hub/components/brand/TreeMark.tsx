import { cn } from "@/lib/utils";

/** Brand mark — Honza’s golden tree asset (`public/brand/tree-mark.png`). */
export default function TreeMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand PNG; sizes via className
    <img
      src="/brand/tree-mark.png"
      alt=""
      width={91}
      height={100}
      className={cn("object-contain", className)}
      aria-hidden
      decoding="async"
    />
  );
}
