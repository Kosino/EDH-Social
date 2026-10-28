import Link from "next/link";
import DataNotice from "@/components/DataNotice";
import SearchBar from "@/components/SearchBar";
import { feedTopicChip } from "@/lib/brand";
import {
  filterPostsByQuery,
  getFeedPosts,
  normalizeSearchQuery,
  searchPosts,
  type FeedPost,
} from "@/lib/supabase/queries";
import { cn, formatRelativePrague } from "@/lib/utils";

const samples: FeedPost[] = [
  {
    id: "sample-kinnan",
    title: "cEDH Primer: Proč je Kinnan stále silný",
    excerpt: "Rozbor combů, mulligan strategie a proč je deck konzistentní i v roce 2026.",
    body: null,
    deckName: "Kinnan, Bonder Prodigy",
    kind: "post",
    authorId: "sample-author-1",
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
    authorId: "sample-author-2",
    author: "Elf_Brewer",
    authorUsername: "elf_brewer",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sample-rules",
    title: "Rule zero bez dramatu",
    excerpt: "Jak si domluvit power level a tempo stolu, než se zamíchá.",
    body: null,
    deckName: null,
    kind: "post",
    authorId: "sample-author-3",
    author: "Kosino",
    authorUsername: "kosino",
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const rawQ = (await searchParams).q;
  const q = normalizeSearchQuery(Array.isArray(rawQ) ? rawQ[0] : rawQ);
  const result = q ? await searchPosts("post", q) : await getFeedPosts();
  const live = result.status === "ok";
  const posts = live ? result.data : filterPostsByQuery(samples, q);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Feed</h1>
          <p className="mt-1 text-sm text-foreground/55">Nejnovější příspěvky z Commander komunity</p>
        </div>
        <Link
          href="/posts/new"
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_-8px] shadow-primary hover:bg-primary/90"
        >
          + Nový příspěvek
        </Link>
      </div>

      <div className="mb-6">
        <SearchBar action="/" defaultValue={q} placeholder="Hledat příspěvky…" />
        {q ? (
          <p className="mt-2 text-xs text-foreground/50">
            Výsledky pro „{q}“ ·{" "}
            <Link href="/" className="text-primary hover:underline">
              Zrušit
            </Link>
          </p>
        ) : null}
      </div>

      {result.status === "error" && <DataNotice message={result.message} />}
      {result.status === "unconfigured" && (
        <DataNotice message="Supabase ještě není nastavené. Níže je jen náhled feedu." />
      )}
      {!live && result.status === "error" ? (
        <p className="mb-4 text-sm text-foreground/50">Zatím ukazujeme ukázkové příspěvky.</p>
      ) : null}

      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 bg-card/60 p-8 text-center text-sm text-foreground/70">
          {q ? (
            <>Pro „{q}“ nic nenašli.</>
          ) : (
            <>
              Zatím tu nic není.{" "}
              <Link href="/posts/new" className="text-primary hover:underline">
                Napiš první příspěvek
              </Link>
              .
            </>
          )}
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
  const topic = feedTopicChip({ title: post.title, deckName: post.deckName });
  const profileHref =
    live && post.authorUsername !== "hráč" ? `/profile/${post.authorUsername}` : null;
  const postHref = live ? `/posts/${post.id}` : null;

  return (
    <article className="animate-fade-rise rounded-2xl border border-white/10 bg-card p-5 transition hover:border-primary/35">
      <div className="mb-4 flex items-center gap-3">
        {profileHref ? (
          <Link
            href={profileHref}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-casual text-sm font-semibold text-white ring-2 ring-primary/30"
            aria-label={`Profil ${post.author}`}
          >
            {initial}
          </Link>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-casual text-sm font-semibold text-white ring-2 ring-primary/30">
            {initial}
          </div>
        )}
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          {profileHref ? (
            <Link href={profileHref} className="truncate font-medium text-foreground hover:text-primary">
              {post.author}
            </Link>
          ) : (
            <span className="truncate font-medium text-foreground">{post.author}</span>
          )}
          <span className="shrink-0 text-xs text-foreground/40">{formatRelativePrague(post.createdAt)}</span>
        </div>
      </div>

      {postHref ? (
        <Link href={postHref}>
          <h2 className="font-display text-lg font-semibold leading-snug text-foreground hover:text-primary">
            {post.title}
          </h2>
        </Link>
      ) : (
        <h2 className="font-display text-lg font-semibold leading-snug text-foreground">{post.title}</h2>
      )}
      {post.excerpt ? (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground/65">{post.excerpt}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", topic.className)}>
            {topic.label}
          </span>
          {post.deckName ? (
            <span className="truncate text-xs text-foreground/45">Deck: {post.deckName}</span>
          ) : null}
        </div>
        {live ? (
          <Link href={`/posts/${post.id}`} className="text-sm font-medium text-primary hover:underline">
            Číst více
          </Link>
        ) : (
          <span className="text-sm text-foreground/35">Náhled</span>
        )}
      </div>
    </article>
  );
}
