import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import type { SessionUser } from "@/lib/supabase/session";

export default function MobileHeader({ user }: { user: SessionUser | null }) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-card/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="font-bold text-primary">
          EDH Hub
        </Link>
        {user ? (
          <form action={signOut}>
            <button type="submit" className="text-sm text-foreground/80">
              Odhlásit
            </button>
          </form>
        ) : (
          <Link href="/login" className="text-sm font-medium text-primary">
            Přihlásit
          </Link>
        )}
      </div>
      <nav className="mt-3 flex gap-4 text-sm text-foreground/70">
        <Link href="/">Feed</Link>
        <Link href="/events">Eventy</Link>
        <Link href={user?.username ? `/profile/${user.username}` : "/profile/me"}>Profil</Link>
      </nav>
    </header>
  );
}
