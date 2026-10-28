import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Feed</h1>
        <p className="text-foreground/60 mt-1">Nejnovější příspěvky z komunity EDH</p>
      </div>

      <div className="space-y-4">
        <PostCard
          author="AetherMaster"
          title="cEDH Primer: Proč je Kinnan stále silný"
          excerpt="Rozbor combů, mulligan strategie a proč je deck konzistentní i v roce 2026."
          deck="Kinnan, Bonder Prodigy"
        />
        <PostCard
          author="Elf_Brewer"
          title="Deck Tech: Henzie „Toolbox“"
          excerpt="ETB abuse, recursion a top-end bombs. Curve, synergie a budget swapy."
          deck="Henzie"
        />
      </div>
    </div>
  );
}

function PostCard({ author, title, excerpt, deck }: { author: string; title: string; excerpt: string; deck: string }) {
  return (
    <article className="bg-card border border-white/10 rounded-xl p-5 hover:border-primary/40 transition">
      <div className="flex items-center gap-3 mb-3 text-sm text-foreground/60">
        <div className="w-8 h-8 rounded-full bg-primary/30" />
        <span>{author}</span>
        <span>•</span>
        <span>před 2 h</span>
      </div>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-foreground/70 text-sm mb-4">{excerpt}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="px-2 py-1 bg-primary/20 text-primary rounded">Deck: {deck}</span>
        <Link href="#" className="text-primary hover:underline">Číst více →</Link>
      </div>
    </article>
  );
}
