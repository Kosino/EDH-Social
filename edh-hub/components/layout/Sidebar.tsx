"use client";

import Link from "next/link";
import { Home, User, Calendar, BookOpen, Plus, LogIn, LogOut } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import type { SessionUser } from "@/lib/supabase/session";

export default function Sidebar({ user }: { user: SessionUser | null }) {
  const profileHref = user?.username ? `/profile/${user.username}` : "/profile/me";

  return (
    <aside className="hidden min-h-screen w-64 border-r border-white/10 bg-card p-6 md:block">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">EDH Hub</h1>
        <p className="mt-1 text-xs text-muted-foreground">Commander Social</p>
      </div>

      <nav className="space-y-1">
        <NavItem href="/" icon={<Home size={18} />} label="Feed" />
        <NavItem href={profileHref} icon={<User size={18} />} label="Profil" />
        <NavItem href="/events" icon={<Calendar size={18} />} label="Eventy" />
        <NavItem href="/feed" icon={<BookOpen size={18} />} label="Články" />
      </nav>

      <div className="mt-8 space-y-3">
        {user ? (
          <>
            <p className="truncate text-xs text-foreground/50">{user.username ?? user.email}</p>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-black transition hover:bg-primary/90"
            >
              <Plus size={16} /> Nový příspěvek
            </button>
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-sm text-foreground/80 transition hover:bg-white/5"
              >
                <LogOut size={16} /> Odhlásit
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-black transition hover:bg-primary/90"
          >
            <LogIn size={16} /> Přihlásit se
          </Link>
        )}
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground/80 transition hover:bg-white/5 hover:text-foreground"
    >
      {icon}
      {label}
    </Link>
  );
}
