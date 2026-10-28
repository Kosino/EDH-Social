import Link from "next/link";
import { toReadableCardImage } from "@/lib/deckbuilder/card-image";
import type { DeckV2ListItem } from "@/lib/deckbuilder/queries";
import { formatRelativePrague } from "@/lib/utils";

export default function DeckListGrid({ decks }: { decks: DeckV2ListItem[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {decks.map((deck) => {
        const art = toReadableCardImage(deck.commanderImageUrl);
        return (
          <li key={deck.id}>
            <Link
              href={`/decks/v2/${deck.id}`}
              className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-card transition hover:border-primary/45"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/25 via-card to-black">
                {art ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={art}
                    alt=""
                    className="h-full w-full object-cover object-[center_20%] opacity-80 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-95"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-display text-lg font-semibold leading-tight">{deck.name}</p>
                  <p className="mt-1 truncate text-xs text-foreground/70">
                    {deck.format} · {deck.commanderName}
                    {deck.partnerName ? ` + ${deck.partnerName}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 text-xs text-foreground/45">
                <span>{deck.cardCount}/100 karet</span>
                <span>{formatRelativePrague(deck.updatedAt)}</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
