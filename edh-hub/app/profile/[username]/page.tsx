import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import BioForm from "@/components/profile/BioForm";
import { isSuperuser } from "@/lib/admin";
import { getProfile, type ProfileDeck } from "@/lib/supabase/queries";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/session";

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
          <h1 className="text-3xl font-bold">Profil se zakládá</h1>
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
      <div className="mb-8 rounded-2xl border border-white/10 bg-card p-6">
        <div className="flex items-start gap-5">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              {profile.displayName}
              {isSuperuser(profile.username) && (
                <span className="ml-3 align-middle rounded bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                  Admin
                </span>
              )}
            </h1>
            <p className="mt-1 text-foreground/70">@{profile.username}</p>
            <p className="mt-3 max-w-xl whitespace-pre-wrap text-sm text-foreground/60">
              {profile.bio || "Zatím bez popisu."}
            </p>
            {isOwner && <BioForm bio={profile.bio} />}
          </div>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Oblíbení commandři</h2>
        {commanders.length === 0 ? (
          <p className="text-sm text-foreground/60">
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
              <div key={commander} className="rounded-xl border border-white/10 bg-card p-4">
                <div className="mb-3 aspect-[63/88] rounded-lg bg-gradient-to-br from-primary/20 to-accent/10" />
                <p className="font-medium">{commander}</p>
                <p className="mt-1 text-xs text-foreground/50">Placeholder art</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Decky</h2>
          {isOwner && (
            <Link href="/decks/new" className="text-sm text-primary hover:underline">
              + Přidat deck
            </Link>
          )}
        </div>
        {profile.decks.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-card p-5 text-sm text-foreground/60">
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

function DemoProfile({ username }: { username: string }) {
  return (
    <div className="max-w-5xl">
      <DataNotice message="Supabase ještě není nastavené. Níže je jen náhled profilu." />
      <div className="mb-8 rounded-2xl border border-white/10 bg-card p-6">
        <div className="flex items-start gap-5">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{username}</h1>
            <p className="mt-1 text-foreground/70">EDH nadšenec • Deck builder</p>
            <p className="mt-3 max-w-xl text-sm text-foreground/60">
              Procházím multivesmír deck po decku. Stavím tematické EDH listy s vysokou synergií.
            </p>
          </div>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Oblíbení commandři</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {["Atraxa", "Yuriko", "Kinnan"].map((cmd) => (
            <div key={cmd} className="rounded-xl border border-white/10 bg-card p-4">
              <div className="mb-3 aspect-[63/88] rounded-lg bg-gradient-to-br from-primary/20 to-accent/10" />
              <p className="font-medium">{cmd}</p>
              <p className="mt-1 text-xs text-foreground/50">Placeholder art</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Decky</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DeckCard deck={{ id: "1", name: "Atraxa Superfriends", format: "EDH", commander: "Atraxa", moxfieldUrl: null }} />
          <DeckCard deck={{ id: "2", name: "Yuriko Ninjas", format: "cEDH", commander: "Yuriko", moxfieldUrl: null }} />
          <DeckCard deck={{ id: "3", name: "Kinnan Combo", format: "cEDH", commander: "Kinnan", moxfieldUrl: null }} />
        </div>
      </section>
    </div>
  );
}

function DeckCard({ deck }: { deck: ProfileDeck }) {
  return (
    <div className="rounded-xl border border-white/10 bg-card p-4 transition hover:border-primary/50">
      <div className="mb-3 flex items-start justify-between">
        <span
          className={`rounded px-2 py-1 text-xs ${
            deck.format === "cEDH" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
          }`}
        >
          {deck.format}
        </span>
      </div>
      <h3 className="font-semibold">{deck.name}</h3>
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
