import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import { deletePost } from "@/app/create/actions";
import { feedTopicChip } from "@/lib/brand";
import { getPost } from "@/lib/supabase/queries";
import { getCurrentUser } from "@/lib/supabase/session";
import { cn, formatRelativePrague } from "@/lib/utils";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getPost(id);

  if (result.status === "error") {
    return (
      <div className="mx-auto max-w-3xl">
        <DataNotice message={result.message} />
        <Link href="/" className="text-sm text-primary hover:underline">
          Zpět na feed
        </Link>
      </div>
    );
  }

  if (result.status !== "ok" || !result.data) notFound();

  if (result.data.kind === "article") {
    redirect(`/articles/${result.data.id}`);
  }

  const post = result.data;
  const user = await getCurrentUser();
  const isOwner = Boolean(user && user.id === post.authorId);
  const topic = feedTopicChip({ title: post.title, deckName: post.deckName });
  const initial = post.author.slice(0, 1).toUpperCase();

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/" className="text-sm text-primary hover:underline">
        ← Feed
      </Link>
      <div className="mb-6 mt-6 flex items-center gap-3">
        {post.authorUsername !== "hráč" ? (
          <Link
            href={`/profile/${post.authorUsername}`}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-casual text-sm font-semibold text-white ring-2 ring-primary/30"
          >
            {initial}
          </Link>
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-casual text-sm font-semibold text-white ring-2 ring-primary/30">
            {initial}
          </div>
        )}
        <div>
          {post.authorUsername !== "hráč" ? (
            <Link
              href={`/profile/${post.authorUsername}`}
              className="font-medium text-foreground hover:text-primary"
            >
              {post.author}
            </Link>
          ) : (
            <span className="font-medium">{post.author}</span>
          )}
          <p className="text-xs text-foreground/45">{formatRelativePrague(post.createdAt)}</p>
        </div>
      </div>
      <h1 className="font-display text-3xl font-bold leading-tight">{post.title}</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", topic.className)}>
          {topic.label}
        </span>
        {post.deckName ? (
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-foreground/70">
            Deck: {post.deckName}
          </span>
        ) : null}
      </div>
      <div className="mt-8 whitespace-pre-wrap rounded-2xl border border-white/10 bg-card p-6 text-sm leading-7 text-foreground/80">
        {post.body || post.excerpt || "Příspěvek nemá text."}
      </div>
      {isOwner ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/posts/${post.id}/edit`}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-foreground/80 hover:bg-white/5"
          >
            Upravit
          </Link>
          <form action={deletePost}>
            <input type="hidden" name="postId" value={post.id} />
            <input type="hidden" name="kind" value="post" />
            <button
              type="submit"
              className="rounded-lg border border-red-400/40 px-4 py-2 text-sm text-red-300 hover:bg-red-400/10"
            >
              Smazat příspěvek
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}
