import Image from "next/image";
import Link from "next/link";
import ProfileEditor from "@/components/profile/ProfileEditor";
import UserAvatar from "@/components/profile/UserAvatar";
import type { MoxfieldCommanderPreview } from "@/lib/moxfield";
import type { ProfileDeck } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";

export function ProfilePreview({
  displayName,
  username,
  rawDisplayName,
  bio,
  avatarKey,
  avatarUrl,
  moxfieldUserUrl,
  isOwner,
  admin,
  commanders,
  moxfieldCommanders,
  decks,
  eventsJoined,
}: {
  displayName: string;
  username: string;
  rawDisplayName: string | null;
  bio: string | null;
  avatarKey: string | null;
  avatarUrl: string | null;
  moxfieldUserUrl: string | null;
  isOwner: boolean;
  admin: boolean;
  commanders: string[];
  moxfieldCommanders: MoxfieldCommanderPreview[];
  decks: ProfileDeck[];
  eventsJoined: number;
}) {
  const showMoxfieldCommanders = Boolean(moxfieldUserUrl) && moxfieldCommanders.length > 0;
  return (
    <div className="max-w-5xl">
      <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-card">
        <div className="h-28 bg-gradient-to-r from-primary via-primary/70 to-accent sm:h-32" />
        <div className="relative px-6 pb-6 pt-0">
          <div className="-mt-12 mb-4">
            <UserAvatar
              displayName={displayName}
              avatarKey={avatarKey}
              avatarUrl={avatarUrl}
              size={96}
              className="border-4 border-card shadow-[0_0_24px_-6px] shadow-primary"
            />
          </div>
          <h1 className="font-display text-3xl font-bold">
            {displayName}
            {admin ? (
              <span className="ml-3 align-middle rounded border border-accent/40 bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
                Admin
              </span>
            ) : null}
          </h1>
          <p className="mt-1 text-sm text-foreground/55">@{username}</p>
          <p className="mt-3 max-w-xl whitespace-pre-wrap text-sm leading-relaxed text-foreground/75">
            {bio || "Zatím bez popisu."}
          </p>
          {moxfieldUserUrl ? (
            <p className="mt-3">
              <a
                href={moxfieldUserUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                Otevřít na Moxfieldu →
              </a>
            </p>
          ) : null}
          {isOwner ? (
            <ProfileEditor
              displayName={displayName}
              rawDisplayName={rawDisplayName}
              bio={bio}
              avatarKey={avatarKey}
              avatarUrl={avatarUrl}
              moxfieldUserUrl={moxfieldUserUrl}
            />
          ) : null}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-card p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <h2 className="font-display text-lg font-semibold">
              {showMoxfieldCommanders ? "Commandři z Moxfieldu" : "Oblíbení commandři"}
            </h2>
            {moxfieldUserUrl ? (
              <a
                href={moxfieldUserUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Profil na Moxfieldu
              </a>
            ) : null}
          </div>
          {showMoxfieldCommanders ? (
            <div className="grid grid-cols-3 gap-3">
              {moxfieldCommanders.map((commander, index) => (
                <MoxfieldCommanderCard key={`${commander.name}-${index}`} commander={commander} tone={index % 3} />
              ))}
            </div>
          ) : commanders.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-sm text-foreground/60">
              {moxfieldUserUrl ? (
                <>
                  Moxfield je propojený, ale náhled commanderů teď nedostupný (API / žádné decky). Zkus obnovit
                  stránku, nebo přidej decky v EDH Social.
                </>
              ) : isOwner ? (
                <>
                  Přidej Moxfield odkaz v úpravě profilu — zobrazí se náhledy commanderů z tvých decků. Nebo{" "}
                  <Link href="/decks/new" className="text-primary hover:underline">
                    přidej deck
                  </Link>
                  .
                </>
              ) : (
                "Zatím žádní commandři."
              )}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {commanders.slice(0, 6).map((commander, index) => (
                <CommanderCard key={commander} commander={commander} tone={index % 3} />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Decky</h2>
            {isOwner ? (
              <Link
                href="/decks/new"
                className="rounded-lg border border-accent px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/10"
              >
                + Přidat
              </Link>
            ) : null}
          </div>
          {decks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-sm text-foreground/60">
              {isOwner ? (
                <>
                  Zatím žádné decky.{" "}
                  <Link href="/decks/new" className="text-primary hover:underline">
                    Vytvoř první
                  </Link>
                  .
                </>
              ) : (
                "Žádné veřejné decky."
              )}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {decks.slice(0, 6).map((deck, index) => (
                <DeckCard key={deck.id} deck={deck} tone={index % 3} />
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="flex flex-wrap gap-8 rounded-2xl border border-white/10 bg-card px-6 py-4 text-sm">
        <p className="text-foreground/55">
          Decky <span className="ml-2 font-display text-lg font-semibold text-foreground">{decks.length}</span>
        </p>
        <p className="text-foreground/55">
          Eventy (RSVP){" "}
          <span className="ml-2 font-display text-lg font-semibold text-foreground">{eventsJoined}</span>
        </p>
      </div>
    </div>
  );
}

const TONES = [
  "from-primary/40 to-primary/10",
  "from-accent/40 to-accent/10",
  "from-casual/40 to-casual/10",
] as const;

function CommanderCard({ commander, tone }: { commander: string; tone: number }) {
  return (
    <div className="animate-fade-rise">
      <div className={cn("mb-2 aspect-[63/88] rounded-lg bg-gradient-to-b", TONES[tone] ?? TONES[0])} />
      <p className="truncate text-center text-sm font-medium">{commander}</p>
    </div>
  );
}

function MoxfieldCommanderCard({
  commander,
  tone,
}: {
  commander: MoxfieldCommanderPreview;
  tone: number;
}) {
  const body = (
    <>
      <div
        className={cn(
          "relative mb-2 aspect-[63/88] overflow-hidden rounded-lg bg-gradient-to-b",
          TONES[tone] ?? TONES[0]
        )}
      >
        {commander.imageUrl ? (
          <Image
            src={commander.imageUrl}
            alt={commander.name}
            fill
            className="object-cover object-top"
            sizes="120px"
            unoptimized
          />
        ) : null}
      </div>
      <p className="truncate text-center text-sm font-medium">{commander.name}</p>
      {commander.deckName ? (
        <p className="truncate text-center text-[10px] text-foreground/45">{commander.deckName}</p>
      ) : (
        <p className="text-center text-[10px] text-foreground/40">Moxfield</p>
      )}
    </>
  );

  if (commander.deckUrl) {
    return (
      <a
        href={commander.deckUrl}
        target="_blank"
        rel="noreferrer"
        className="animate-fade-rise block transition hover:opacity-90"
      >
        {body}
      </a>
    );
  }

  return <div className="animate-fade-rise">{body}</div>;
}

function DeckCard({ deck, tone }: { deck: ProfileDeck; tone: number }) {
  const formatClass =
    deck.format === "cEDH"
      ? "bg-primary/25 text-primary"
      : tone % 2 === 0
        ? "bg-accent/25 text-accent"
        : "bg-casual/25 text-casual";

  return (
    <Link
      href={`/decks/${deck.id}`}
      className="animate-fade-rise group relative flex min-h-[9.5rem] flex-col overflow-hidden rounded-xl border border-white/10 transition hover:border-primary/45"
    >
      {deck.commanderImageUrl ? (
        <Image
          src={deck.commanderImageUrl}
          alt=""
          fill
          className="object-cover object-top transition duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, 200px"
          unoptimized
        />
      ) : (
        <div className={cn("absolute inset-0 bg-gradient-to-b", TONES[tone] ?? TONES[0])} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
      <div className="relative z-10 flex h-full flex-col p-3">
        <span
          className={cn(
            "mb-3 w-fit rounded px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm",
            formatClass
          )}
        >
          {deck.format}
        </span>
        <h3 className="mt-auto font-display text-sm font-semibold leading-snug text-white drop-shadow">
          {deck.name}
        </h3>
        <p className="mt-1 truncate text-xs text-white/70">{deck.commander}</p>
        {deck.moxfieldUrl ? (
          <span className="pt-2 text-xs text-primary">Moxfield →</span>
        ) : (
          <p className="pt-2 text-xs text-white/35">Bez Moxfield</p>
        )}
      </div>
    </Link>
  );
}
