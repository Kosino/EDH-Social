import Link from "next/link";
import { notFound } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import { deleteDeck } from "@/app/create/actions";
import { getDeck } from "@/lib/supabase/queries";
import { getCurrentUser } from "@/lib/supabase/session";
import { cn, formatRelativePrague } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getDeck(id);

  if (result.status === "error") {
    return (
      <div className="mx-auto max-w-2xl">
        <DataNotice message={result.message} />
        <Link href="/" className="text-sm text-primary hover:underline">
          Zpět na feed
        </Link>
      </div>
    );
  }

  if (result.status === "unconfigured") {
    return (
      <div className="mx-auto max-w-2xl">
        <DataNotice message="Supabase ještě není nastavené." />
      </div>
    );
  }

  if (!result.data) notFound();

  const deck = result.data;
  const user = await getCurrentUser();
  const isOwner = Boolean(user && user.id === deck.ownerId);
  const formatClass =
    deck.format === "cEDH" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent";
  const profileHref = `/profile/${deck.ownerUsername}`;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={profileHref} className="text-sm text-primary hover:underline">
        ← Profil @{deck.ownerUsername}
      </Link>

      <div className="mt-6 animate-fade-rise overflow-hidden rounded-2xl border border-white/10 bg-card">
        <div
          className={cn(
            "aspect-[16/7] bg-gradient-to-br",
            deck.format === "cEDH" ? "from-primary/50 to-primary/10" : "from-accent/45 to-casual/15"
          )}
        />
        <div className="p-6">
          <span className={cn("rounded px-2 py-0.5 text-[11px] font-medium", formatClass)}>
            {deck.format}
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight">{deck.name}</h1>
          <p className="mt-2 text-foreground/70">
            Commander: <span className="font-medium text-foreground">{deck.commander}</span>
          </p>
          <p className="mt-4 text-sm text-foreground/50">
            Majitel{" "}
            <Link href={profileHref} className="text-foreground hover:text-primary">
              {deck.ownerDisplayName}
            </Link>
            <span className="text-foreground/35"> · @{deck.ownerUsername}</span>
            <span className="text-foreground/35"> · {formatRelativePrague(deck.createdAt)}</span>
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {deck.moxfieldUrl ? (
              <a
                href={deck.moxfieldUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                Otevřít na Moxfield
              </a>
            ) : (
              <span className="rounded-lg border border-white/10 px-4 py-2 text-sm text-foreground/45">
                Bez Moxfield odkazu
              </span>
            )}
            {isOwner ? (
              <form action={deleteDeck}>
                <input type="hidden" name="deckId" value={deck.id} />
                <input type="hidden" name="username" value={deck.ownerUsername} />
                <button
                  type="submit"
                  className="rounded-lg border border-red-400/40 px-4 py-2 text-sm text-red-300 hover:bg-red-400/10"
                >
                  Smazat deck
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
