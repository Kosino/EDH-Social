import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import BioForm from "@/components/profile/BioForm";
import { isSuperuser } from "@/lib/admin";
import { getProfile, getRsvpCount, type ProfileDeck } from "@/lib/supabase/queries";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/session";
import { cn } from "@/lib/utils";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = await params;

  if (!getSupabaseEnv()) {
    const username = rawUsername === "me" ? "AetherMaster" : rawUsername;
    return <DemoProfile username={username} />;
  }

  if (rawUsername === "me") {
    const user = await getCurrentUser();
    if (!user) redirect("/login");
    if (!user.username) {
      return (
        <div className="max-w-xl">
          <h1 className="font-display text-3xl font-bold">Profil se zakládá</h1>
          <p className="mt-2 text-sm text-foreground/70">
            Účet {user.email} je přihlášený, ale řádek v tabulce profiles chybí. Spusť migraci, pokud
            jsi ji ještě nespustil, a přihlas se znovu.
          </p>
        </div>
      );
    }
    redirect(`/profile/${user.username}`);
  }

  const result = await getProfile(rawUsername);
  if (result.status === "error") {
    return (
      <div className="max-w-5xl">
        <DataNotice message={result.message} />
      </div>
    );
  }
  if (result.status !== "ok" || !result.data) notFound();

  const profile = result.data;
  const viewer = await getCurrentUser();
  const isOwner = viewer?.username === profile.username;
  const commanders = Array.from(new Set(profile.decks.map((deck) => deck.commander)));
  const eventsJoined = await getRsvpCount(profile.id);

  return (
    <ProfileLayout
      displayName={profile.displayName}
      username={profile.username}
      bio={profile.bio}
      isOwner={isOwner}
      admin={isSuperuser(profile.username)}
      commanders={commanders}
      decks={profile.decks}
      eventsJoined={eventsJoined}
    />
  );
}

function ProfileLayout({
  displayName,
  username,
  bio,
  isOwner,
  admin,
  commanders,
  decks,
  eventsJoined,
}: {
  displayName: string;
  username: string;
  bio: string | null;
  isOwner: boolean;
  admin: boolean;
  commanders: string[];
  decks: ProfileDeck[];
  eventsJoined: number;
}) {
  return (
    <div className="max-w-5xl">
      <ProfileHero
        displayName={displayName}
        username={username}
        bio={bio}
        isOwner={isOwner}
        admin={admin}
      />

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">Oblíbení commandři</h2>
          {commanders.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-sm text-foreground/60">
              Zatím žádní commandři.
              {isOwner ? (
                <>
                  {" "}
                  <Link href="/decks/new" className="text-primary hover:underline">
                    Přidej deck
                  </Link>
                  .
                </>
              ) : null}
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
        <Stat label="Decky" value={decks.length} />
        <Stat label="Eventy (RSVP)" value={eventsJoined} />
      </div>
    </div>
  );
}

function ProfileHero({
  displayName,
  username,
  bio,
  isOwner,
  admin,
}: {
  displayName: string;
  username: string;
  bio: string | null;
  isOwner: boolean;
  admin: boolean;
}) {
  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-card">
      <div className="h-28 bg-gradient-to-r from-primary via-primary/70 to-accent sm:h-32" />
      <div className="relative px-6 pb-6 pt-0">
        <div className="-mt-12 mb-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-card bg-gradient-to-br from-primary to-casual font-display text-3xl font-bold text-white shadow-[0_0_24px_-6px] shadow-primary">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
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
        {isOwner ? <BioForm bio={bio} /> : null}
      </div>
    </div>
  );
}

function DemoProfile({ username }: { username: string }) {
  return (
    <div className="max-w-5xl">
      <DataNotice message="Supabase ještě není nastavené. Níže je jen náhled profilu." />
      <ProfileLayout
        displayName={username}
        username={username.toLowerCase()}
        bio="Procházím multivesmír deck po decku. Stavím tematické EDH listy s vysokou synergií."
        isOwner={false}
        admin={false}
        commanders={["Atraxa", "Yuriko", "Kinnan"]}
        decks={[
          { id: "1", name: "Atraxa Superfriends", format: "EDH", commander: "Atraxa", moxfieldUrl: null },
          { id: "2", name: "Yuriko Ninjas", format: "cEDH", commander: "Yuriko", moxfieldUrl: null },
          { id: "3", name: "Kinnan Combo", format: "cEDH", commander: "Kinnan", moxfieldUrl: null },
        ]}
        eventsJoined={12}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <p className="text-foreground/55">
      {label} <span className="ml-2 font-display text-lg font-semibold text-foreground">{value}</span>
    </p>
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
      <p className="text-center text-[10px] text-foreground/40">Placeholder</p>
    </div>
  );
}

function DeckCard({ deck, tone }: { deck: ProfileDeck; tone: number }) {
  const formatClass =
    deck.format === "cEDH"
      ? "bg-primary/20 text-primary"
      : tone % 2 === 0
        ? "bg-accent/20 text-accent"
        : "bg-casual/20 text-casual";

  return (
    <div
      className={cn(
        "animate-fade-rise flex flex-col rounded-xl border border-white/10 bg-gradient-to-b p-3",
        TONES[tone] ?? TONES[0]
      )}
    >
      <span className={cn("mb-3 w-fit rounded px-2 py-0.5 text-[10px] font-medium", formatClass)}>
        {deck.format}
      </span>
      <h3 className="font-display text-sm font-semibold leading-snug">{deck.name}</h3>
      <p className="mt-1 text-xs text-foreground/60">{deck.commander}</p>
      {deck.moxfieldUrl ? (
        <a
          href={deck.moxfieldUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-auto pt-3 text-xs text-primary hover:underline"
        >
          Moxfield →
        </a>
      ) : (
        <p className="mt-auto pt-3 text-xs text-foreground/35">Bez Moxfield</p>
      )}
    </div>
  );
}
