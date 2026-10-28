import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import TreeMark from "@/components/brand/TreeMark";
import { isSuperuser } from "@/lib/admin";
import { BRAND_NAME } from "@/lib/brand";
import type { SessionUser } from "@/lib/supabase/session";

export default function MobileHeader({ user }: { user: SessionUser | null }) {
  const showAdmin = isSuperuser(user?.username);

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-card/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-foreground">
          <TreeMark className="h-7 w-7" />
          {BRAND_NAME}
        </Link>
        {user ? (
          <form action={signOut}>
            <button type="submit" className="text-sm text-foreground/80">
              Odhlásit
            </button>
          </form>
        ) : (
          <Link href="/login" className="text-sm font-medium text-primary">
            Přihlásit se
          </Link>
        )}
      </div>
      <nav className="mt-3 flex flex-wrap gap-4 text-sm text-foreground/70">
        <Link href="/">Domů</Link>
        <Link href="/feed">Feed</Link>
        <Link href="/events">Eventy</Link>
        <Link href="/articles">Články</Link>
        <Link href="/taverna">Taverna</Link>
        <Link href="/taverna/deckbuilder">Deckbuilder</Link>
        {user?.username ? <Link href={`/profile/${user.username}`}>Profil</Link> : null}
        {showAdmin ? <Link href="/admin">Admin</Link> : null}
        {user ? <Link href="/posts/new">Příspěvek</Link> : null}
      </nav>
    </header>
  );
}
