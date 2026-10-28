import { toReadableCardImage } from "@/lib/deckbuilder/card-image";
import { cn } from "@/lib/utils";

export default function DeckCardTile({
  name,
  quantity,
  manaCost,
  typeLine,
  imageUrl,
  illegal,
  reasons,
  visual = false,
}: {
  name: string;
  quantity: number;
  manaCost?: string | null;
  typeLine?: string | null;
  imageUrl?: string | null;
  illegal: boolean;
  reasons?: string[];
  /** Full-face visual grid tile (editor). */
  visual?: boolean;
}) {
  const src = toReadableCardImage(imageUrl);
  const title = illegal && reasons?.length ? reasons.join(" · ") : undefined;

  if (visual) {
    return (
      <div
        className={cn(
          "deck-card relative overflow-hidden rounded-xl border border-white/10 bg-black/30",
          illegal && "deck-card--illegal"
        )}
        title={title}
      >
        <div className="relative aspect-[5/7] w-full">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={name} className="h-full w-full object-cover object-top" />
          ) : (
            <div className="flex h-full items-end bg-gradient-to-b from-primary/25 to-white/[0.03] p-2">
              <p className="text-xs font-medium leading-snug">{name}</p>
            </div>
          )}
          {quantity > 1 ? (
            <span className="absolute left-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold">
              {quantity}×
            </span>
          ) : null}
        </div>
        <div className="truncate px-2 py-1.5 text-[11px] text-foreground/70">{name}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "deck-card relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]",
        illegal && "deck-card--illegal"
      )}
      title={title}
    >
      <div className="flex gap-3 p-3">
        <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-gradient-to-b from-primary/30 to-primary/5">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="h-full w-full object-cover object-top" />
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
