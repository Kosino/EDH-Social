"use client";

import Link from "next/link";
import { Home, User, Calendar, BookOpen, Plus } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-card border-r border-white/10 p-6 hidden md:block">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">EDH Hub</h1>
        <p className="text-xs text-muted-foreground mt-1">Commander Social</p>
      </div>

      <nav className="space-y-1">
        <NavItem href="/" icon={<Home size={18} />} label="Feed" />
        <NavItem href="/profile/me" icon={<User size={18} />} label="Profil" />
        <NavItem href="/events" icon={<Calendar size={18} />} label="Eventy" />
        <NavItem href="/feed" icon={<BookOpen size={18} />} label="Články" />
      </nav>

      <div className="mt-8">
        <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-black font-medium py-2.5 rounded-lg text-sm transition">
          <Plus size={16} /> Nový příspěvek
        </button>
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-white/5 transition text-foreground/80 hover:text-foreground"
    >
      {icon}
      {label}
    </Link>
  );
}
