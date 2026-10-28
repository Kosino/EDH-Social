import Link from "next/link";
import { redirect } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import ImportDecklistForm from "@/components/deckbuilder/ImportDecklistForm";
import { isFeatureEnabled } from "@/lib/deckbuilder/feature-flags";
import { listMyDecksV2 } from "@/lib/deckbuilder/queries";
import { getCurrentUser } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

export default async function ImportDecklistPage() {
  const [user, coreOn, importOn] = await Promise.all([
    getCurrentUser(),
    isFeatureEnabled("deckbuilder_core"),
    isFeatureEnabled("deckbuilder_import"),
  ]);

  if (!user) redirect("/login?next=/taverna/deckbuilder/import");

  if (!coreOn) {
    return (
      <div className="mx-auto max-w-xl">
        <DataNotice message="Deckbuilder (deckbuilder_core) není zapnutý." />
      </div>
    );
  }

  if (!importOn) {
    return (
      <div className="mx-auto max-w-xl">
        <DataNotice message="Import (deckbuilder_import) není zapnutý. Zapni flag v feature_flags." />
      </div>
    );
  }

  const decksResult = await listMyDecksV2(user.id);
  const decks =
    decksResult.status === "ok"
      ? decksResult.data.map((d) => ({ id: d.id, name: d.name }))
      : [];

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-4 text-sm text-foreground/50">
        <Link href="/taverna" className="text-primary hover:underline">
          Taverna
        </Link>
        <span className="mx-2">/</span>
        <Link href="/taverna/deckbuilder" className="text-primary hover:underline">
          Deckbuilder
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground/70">Import</span>
      </nav>

      <p className="text-xs font-medium uppercase tracking-wider text-accent">Taverna u Kosa</p>
      <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Importovat seznam</h1>
      <p className="mt-2 mb-6 text-sm text-foreground/55">
        Textový export (Arena / Moxfield) → cílový Taverna deck → visual editor.
      </p>

      {decksResult.status === "error" ? <DataNotice message={decksResult.message} /> : null}

      <ImportDecklistForm decks={decks} showTitle={false} />
    </div>
  );
}
