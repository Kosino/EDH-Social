import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import BioForm from "@/components/profile/BioForm";
import { isSuperuser } from "@/lib/admin";
import { getProfile, type ProfileDeck } from "@/lib/supabase/queries";
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

  return (
    <div className="max-w-5xl">
      <ProfileHero
        displayName={profile.displayName}
        username={profile.username}
        bio={profile.bio}
        isOwner={isOwner}
        admin={isSuperuser(profile.username)}
      />

      <section className="mb-10">
        <h2 className="mb-4 font-display text-xl font-semibold">Oblíbení commandři</h2>
        {commanders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 bg-card/60 p-6 text-sm text-foreground/60">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {commanders.map((commander) => (
              <CommanderCard key={commander} commander={commander} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">Decky</h2>
          {isOwner && (
            <Link
              href="/decks/new"
              className="rounded-lg border border-accent px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/10"
            >
              + Přidat deck
            </Link>
          )}
        </div>
        {profile.decks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 bg-card/60 p-6 text-sm text-foreground/60">
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profile.decks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        )}
      </section>
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
      <div className="h-20 bg-gradient-to-r from-primary/40 via-casual/20 to-accent/30" />
      <div className="px-6 pb-6">
        <div className="-mt-10 mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-card bg-gradient-to-br from-primary to-casual font-display text-2xl font-bold text-white">
          {displayName.slice(0, 1).toUpperCase()}
        </div>
        <h1 className="font-display text-3xl font-bold">
          {displayName}
          {admin ? (
            <span className="ml-3 align-middle rounded bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
              Admin
            </span>
          ) : null}
        </h1>
        <p className="mt-1 text-foreground/60">@{username}</p>
        <p className="mt-3 max-w-xl whitespace-pre-wrap text-sm text-foreground/70">
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
      <ProfileHero
        displayName={username}
        username={username.toLowerCase()}
        bio="Procházím multivesmír deck po decku. Stavím tematické EDH listy s vysokou synergií."
        isOwner={false}
        admin={false}
      />

      <section className="mb-10">
        <h2 className="mb-4 font-display text-xl font-semibold">Oblíbení commandři</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {["Atraxa", "Yuriko", "Kinnan"].map((cmd) => (
            <CommanderCard key={cmd} commander={cmd} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">Decky</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DeckCard deck={{ id: "1", name: "Atraxa Superfriends", format: "EDH", commander: "Atraxa", moxfieldUrl: null }} />
          <DeckCard deck={{ id: "2", name: "Yuriko Ninjas", format: "cEDH", commander: "Yuriko", moxfieldUrl: null }} />
          <DeckCard deck={{ id: "3", name: "Kinnan Combo", format: "cEDH", commander: "Kinnan", moxfieldUrl: null }} />
        </div>
      </section>
    </div>
  );
}

function CommanderCard({ commander }: { commander: string }) {
  return (
    <div className="animate-fade-rise rounded-xl border border-white/10 bg-card p-4 transition hover:border-primary/40">
      <div className="mb-3 aspect-[63/88] rounded-lg bg-gradient-to-br from-primary/25 via-casual/10 to-accent/15" />
      <p className="font-medium">{commander}</p>
      <p className="mt-1 text-xs text-foreground/50">Placeholder art</p>
    </div>
  );
}

function DeckCard({ deck }: { deck: ProfileDeck }) {
  return (
    <div className="animate-fade-rise rounded-xl border border-white/10 bg-card p-4 transition hover:border-primary/50">
      <div className="mb-3 flex items-start justify-between">
        <span
          className={cn(
            "rounded px-2 py-1 text-xs",
            deck.format === "cEDH" ? "bg-accent/20 text-accent" : "bg-casual/20 text-casual"
          )}
        >
          {deck.format}
        </span>
      </div>
      <h3 className="font-display font-semibold">{deck.name}</h3>
      <p className="mt-1 text-sm text-foreground/60">{deck.commander}</p>
      {deck.moxfieldUrl ? (
        <a
          href={deck.moxfieldUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-sm text-primary hover:underline"
        >
          Otevřít na Moxfield →
        </a>
      ) : (
        <p className="mt-4 text-sm text-foreground/40">Bez odkazu na Moxfield</p>
      )}
    </div>
  );
}
