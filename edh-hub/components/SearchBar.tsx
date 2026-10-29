import { Search } from "lucide-react";

export default function SearchBar({
  action,
  defaultValue = "",
  placeholder,
  preserve,
}: {
  action: string;
  defaultValue?: string;
  placeholder: string;
  /** Extra hidden fields to keep (e.g. month on events). */
  preserve?: Record<string, string>;
}) {
  return (
    <form action={action} method="get" className="relative w-full max-w-xl" role="search">
      {preserve
        ? Object.entries(preserve).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      <Search
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40"
        aria-hidden
      />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={80}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-foreground/35 focus:border-primary/70 focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/20"
      />
    </form>
  );
}
