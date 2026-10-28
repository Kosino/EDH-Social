import { cn } from "@/lib/utils";

export default function DeckCardTile({
  name,
  quantity,
  manaCost,
  typeLine,
  imageUrl,
  illegal,
  reasons,
}: {
  name: string;
  quantity: number;
  manaCost?: string | null;
  typeLine?: string | null;
  imageUrl?: string | null;
  illegal: boolean;
  reasons?: string[];
}) {
  return (
    <div
      className={cn(
        "deck-card relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]",
        illegal && "deck-card--illegal"
      )}
      title={illegal && reasons?.length ? reasons.join(" · ") : undefined}
    >
      <div className="flex gap-3 p-3">
        <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-gradient-to-b from-primary/30 to-primary/5">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-full w-full object-cover object-top" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {quantity > 1 ? <span className="text-foreground/50">{quantity}× </span> : null}
            {name}
          </p>
          {manaCost ? <p className="mt-0.5 text-xs text-foreground/45">{manaCost}</p> : null}
          {typeLine ? <p className="truncate text-[11px] text-foreground/40">{typeLine}</p> : null}
          {illegal ? (
            <p className="mt-1 text-[11px] text-red-300">{reasons?.[0] ?? "Nelegální"}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
