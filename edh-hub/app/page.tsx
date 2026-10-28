import Link from "next/link";
import DataNotice from "@/components/DataNotice";
import { getFeedPosts, type FeedPost } from "@/lib/supabase/queries";
import { formatRelativePrague } from "@/lib/utils";

const samples: FeedPost[] = [
  {
    id: "sample-kinnan",
    title: "cEDH Primer: Proč je Kinnan stále silný",
    excerpt: "Rozbor combů, mulligan strategie a proč je deck konzistentní i v roce 2026.",
    body: null,
    deckName: "Kinnan, Bonder Prodigy",
    author: "AetherMaster",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sample-henzie",
    title: "Deck Tech: Henzie „Toolbox“",
    excerpt: "ETB abuse, recursion a top-end bombs. Curve, synergie a budget swapy.",
    body: null,
    deckName: "Henzie",
    author: "Elf_Brewer",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

export default async function Home() {
  const result = await getFeedPosts();
  const posts = result.status === "ok" ? result.data : samples;
  const live = result.status === "ok";

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Feed</h1>
        <p className="mt-1 text-foreground/60">Nejnovější příspěvky z komunity EDH</p>
      </div>

      {result.status === "error" && <DataNotice message={result.message} />}

      {posts.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-card p-5 text-sm text-foreground/70">
          Zatím tu nic není. Až někdo napíše příspěvek, objeví se tady.
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
  return (
    <article className="rounded-xl border border-white/10 bg-card p-5 transition hover:border-primary/40">
      <div className="mb-3 flex items-center gap-3 text-sm text-foreground/60">
        <div className="h-8 w-8 rounded-full bg-primary/30" />
        <span>{post.author}</span>
        <span>•</span>
        <span>{formatRelativePrague(post.createdAt)}</span>
      </div>
      <h2 className="mb-2 text-lg font-semibold">{post.title}</h2>
      {post.excerpt && <p className="mb-4 text-sm text-foreground/70">{post.excerpt}</p>}
      <div className="flex items-center justify-between text-xs">
        {post.deckName ? (
          <span className="rounded bg-primary/20 px-2 py-1 text-primary">Deck: {post.deckName}</span>
        ) : (
          <span />
        )}
        {live ? (
          <Link href={`/posts/${post.id}`} className="text-primary hover:underline">
            Číst více →
          </Link>
        ) : (
          <span className="text-foreground/40">Náhled</span>
        )}
      </div>
    </article>
  );
}
