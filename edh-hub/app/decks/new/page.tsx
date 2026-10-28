import Link from "next/link";
import { redirect } from "next/navigation";
import DeckForm from "@/components/forms/DeckForm";
import { getCurrentUser } from "@/lib/supabase/session";

export default async function NewDeckPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/decks/new");
  const profileHref = user.username ? `/profile/${user.username}` : "/profile/me";

  return (
    <div className="mx-auto max-w-xl">
      <Link href={profileHref} className="text-sm text-primary hover:underline">
        ← Profil
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Nový deck</h1>
      <p className="mt-1 text-foreground/60">Veřejný deck na tvém profilu.</p>
      <DeckForm />
    </div>
  );
}
