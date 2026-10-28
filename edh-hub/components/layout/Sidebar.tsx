"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Newspaper,
  User,
  Calendar,
  BookOpen,
  Plus,
  LogIn,
  LogOut,
  Shield,
  Beer,
  Layers,
  Upload,
} from "lucide-react";
import { signOut } from "@/app/auth/actions";
import TreeMark from "@/components/brand/TreeMark";
import { isSuperuser, publicName } from "@/lib/admin";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import type { SessionUser } from "@/lib/supabase/session";
import { cn } from "@/lib/utils";

export default function Sidebar({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const profileHref = user?.username ? `/profile/${user.username}` : null;
  const showAdmin = isSuperuser(user?.username);
  const tavernaOpen =
    pathname.startsWith("/taverna") ||
    pathname.startsWith("/decks/new") ||
    pathname.startsWith("/decks/v2");

  return (
    <aside className="hidden min-h-screen w-64 flex-col border-r border-white/10 bg-card p-6 md:flex">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-3">
          <TreeMark className="h-9 w-9 shrink-0" />
          <span>
            <span className="block font-display text-xl font-bold tracking-tight text-foreground">
              {BRAND_NAME}
            </span>
            <span className="mt-0.5 block text-xs text-foreground/50">{BRAND_TAGLINE}</span>
          </span>
        </Link>
      </div>

      <nav className="space-y-1">
        <NavItem href="/" icon={<Home size={18} />} label="Domů" active={pathname === "/"} />
        <NavItem
          href="/feed"
          icon={<Newspaper size={18} />}
          label="Feed"
          active={pathname === "/feed" || pathname.startsWith("/posts")}
        />
        {profileHref ? (
          <NavItem
            href={profileHref}
            icon={<User size={18} />}
            label="Profil"
            active={pathname.startsWith("/profile")}
          />
        ) : null}
        <NavItem
          href="/events"
          icon={<Calendar size={18} />}
          label="Eventy"
          active={pathname.startsWith("/events")}
        />
        <NavItem
          href="/articles"
          icon={<BookOpen size={18} />}
          label="Články"
          active={pathname.startsWith("/articles")}
        />

        <NavItem
          href="/taverna"
          icon={<Beer size={18} />}
          label="Taverna"
          active={pathname === "/taverna"}
        />
        {tavernaOpen ? (
          <div className="ml-4 space-y-1 border-l border-white/10 pl-2">
            <NavItem
              href="/taverna/deckbuilder"
              icon={<Layers size={16} />}
              label="Deckbuilder"
              active={
                pathname === "/taverna/deckbuilder" ||
                pathname.startsWith("/decks/new") ||
                pathname.startsWith("/decks/v2")
              }
              compact
            />
            <NavItem
              href="/taverna/deckbuilder/import"
              icon={<Upload size={16} />}
              label="Importovat seznam"
              active={pathname.startsWith("/taverna/deckbuilder/import")}
              compact
            />
          </div>
        ) : null}

        {showAdmin ? (
          <NavItem
            href="/admin"
            icon={<Shield size={18} />}
            label="Admin"
            active={pathname.startsWith("/admin")}
          />
        ) : null}
      </nav>

      <div className="mt-8 space-y-3">
        {user ? (
          <Link
            href="/posts/new"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            <Plus size={16} /> Nový příspěvek
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            <LogIn size={16} /> Přihlásit se
          </Link>
        )}
      </div>

      <div className="mt-auto space-y-3 pt-8">
        {user && profileHref ? (
          <>
            <Link
              href={profileHref}
              className="block rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-primary/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-casual text-sm font-semibold text-white">
                  {(user.username ?? "?").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {user.username ? publicName(user.username) : user.email}
                  </p>
                  {user.username ? (
                    <p className="truncate text-xs text-foreground/50">@{user.username}</p>
                  ) : null}
                </div>
              </div>
              <p className="mt-2 text-xs text-primary">Zobrazit profil →</p>
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-sm text-foreground/80 transition hover:bg-white/5"
              >
                <LogOut size={16} /> Odhlásit
              </button>
            </form>
          </>
        ) : null}
      </div>
    </aside>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
  compact,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg text-sm transition",
        compact ? "px-2.5 py-2" : "px-3 py-2.5",
        active
          ? "bg-primary/20 font-medium text-primary"
          : "text-foreground/80 hover:bg-white/5 hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
