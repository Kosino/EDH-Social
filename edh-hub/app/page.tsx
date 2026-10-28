import Link from "next/link";
import DataNotice from "@/components/DataNotice";
import { getFeedPosts, type FeedPost } from "@/lib/supabase/queries";
import { cn, formatRelativePrague } from "@/lib/utils";

const samples: FeedPost[] = [
  {
    id: "sample-kinnan",
    title: "cEDH Primer: Proč je Kinnan stále silný",
    excerpt: "Rozbor combů, mulligan strategie a proč je deck konzistentní i v roce 2026.",
    body: null,
    deckName: "Kinnan, Bonder Prodigy",
    kind: "post",
    author: "AetherMaster",
    authorUsername: "aethermaster",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sample-henzie",
    title: "Deck Tech: Henzie „Toolbox“",
    excerpt: "ETB abuse, recursion a top-end bombs. Curve, synergie a budget swapy.",
    body: null,
    deckName: "Henzie",
    kind: "post",
    author: "Elf_Brewer",
    authorUsername: "elf_brewer",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

export default async function Home() {
  const result = await getFeedPosts();
  const live = result.status === "ok";
  const posts = live ? result.data : samples;

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Feed</h1>
          <p className="mt-1 text-foreground/60">Nejnovější příspěvky z komunity EDH</p>
        </div>
        <Link
          href="/posts/new"
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          + Nový příspěvek
        </Link>
      </div>

      {result.status === "error" && <DataNotice message={result.message} />}
      {result.status === "unconfigured" && (
        <DataNotice message="Supabase ještě není nastavené. Níže je jen náhled feedu." />
      )}
      {!live && result.status === "error" ? (
        <p className="mb-4 text-sm text-foreground/50">Zatím ukazujeme ukázkové příspěvky.</p>
      ) : null}

      {live && posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 bg-card/60 p-8 text-center text-sm text-foreground/70">
          Zatím tu nic není.{" "}
          <Link href="/posts/new" className="text-primary hover:underline">
            Napiš první příspěvek
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} live={live} />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({ post, live }: { post: FeedPost; live: boolean }) {
  const initial = post.author.slice(0, 1).toUpperCase();

  return (
    <article className="animate-fade-rise rounded-xl border border-white/10 bg-card p-5 transition hover:border-primary/40">
      <div className="mb-3 flex items-center gap-3 text-sm text-foreground/60">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-casual text-xs font-semibold text-white"
          )}
        >
          {initial}
        </div>
        <div className="min-w-0">
          {live && post.authorUsername !== "hráč" ? (
            <Link
              href={`/profile/${post.authorUsername}`}
              className="font-medium text-foreground hover:text-primary hover:underline"
            >
              {post.author}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{post.author}</span>
          )}
          <p className="text-xs text-foreground/45">{formatRelativePrague(post.createdAt)}</p>
        </div>
      </div>
      <h2 className="mb-2 font-display text-lg font-semibold">{post.title}</h2>
      {post.excerpt && <p className="mb-4 text-sm leading-relaxed text-foreground/70">{post.excerpt}</p>}
      <div className="flex items-center justify-between gap-3 text-xs">
        {post.deckName ? (
          <span className="rounded-md bg-primary/15 px-2 py-1 text-primary">Deck: {post.deckName}</span>
        ) : (
          <span />
        )}
        {live ? (
          <Link href={`/posts/${post.id}`} className="font-medium text-primary hover:underline">
            Číst více →
          </Link>
        ) : (
          <span className="text-foreground/40">Náhled</span>
        )}
      </div>
    </article>
  );
}
