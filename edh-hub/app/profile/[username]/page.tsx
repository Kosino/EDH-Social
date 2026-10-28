import { notFound, redirect } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import { ProfilePreview } from "@/components/profile/ProfilePreview";
import { isSuperuser } from "@/lib/admin";
import { getMoxfieldCommanderPreviews } from "@/lib/moxfield";
import { getProfile, getRsvpCount } from "@/lib/supabase/queries";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/session";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = await params;

  if (!getSupabaseEnv()) {
    const username = rawUsername === "me" ? "AetherMaster" : rawUsername;
    return (
      <div className="max-w-5xl">
        <DataNotice message="Supabase ještě není nastavené. Níže je jen náhled profilu." />
        <ProfilePreview
          displayName={username}
          username={username.toLowerCase()}
          rawDisplayName={username}
          bio="Procházím multivesmír deck po decku. Stavím tematické EDH listy s vysokou synergií."
          avatarKey="forest-elf"
          avatarUrl={null}
          moxfieldUserUrl={null}
          isOwner={false}
          admin={false}
          commanders={["Atraxa", "Yuriko", "Kinnan"]}
          moxfieldCommanders={[]}
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

  if (rawUsername === "me") {
    const user = await getCurrentUser();
    if (!user) redirect("/");
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
  const [eventsJoined, moxfieldCommanders] = await Promise.all([
    getRsvpCount(profile.id),
    profile.moxfieldUserUrl
      ? getMoxfieldCommanderPreviews({
          moxfieldUserUrl: profile.moxfieldUserUrl,
          localCommanders: commanders,
        })
      : Promise.resolve([]),
  ]);

  return (
    <ProfilePreview
      displayName={profile.displayName}
      username={profile.username}
      rawDisplayName={profile.rawDisplayName}
      bio={profile.bio}
      avatarKey={profile.avatarKey}
      avatarUrl={profile.avatarUrl}
      moxfieldUserUrl={profile.moxfieldUserUrl}
      isOwner={isOwner}
      admin={isSuperuser(profile.username)}
      commanders={commanders}
      moxfieldCommanders={moxfieldCommanders}
      decks={profile.decks}
      eventsJoined={eventsJoined}
    />
  );
}
