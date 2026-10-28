import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import { getPost } from "@/lib/supabase/queries";
import { formatRelativePrague } from "@/lib/utils";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getPost(id);

  if (result.status === "error") {
    return (
      <div className="max-w-3xl">
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

  return (
    <article className="max-w-3xl">
      <Link href="/" className="text-sm text-primary hover:underline">
        ← Feed
      </Link>
      <div className="mb-6 mt-4 flex items-center gap-3 text-sm text-foreground/60">
        <div className="h-8 w-8 rounded-full bg-primary/30" />
        {post.authorUsername !== "hráč" ? (
          <Link href={`/profile/${post.authorUsername}`} className="hover:text-primary hover:underline">
            {post.author}
          </Link>
        ) : (
          <span>{post.author}</span>
        )}
        <span>•</span>
        <span>{formatRelativePrague(post.createdAt)}</span>
      </div>
      <h1 className="text-3xl font-bold">{post.title}</h1>
      {post.deckName && (
        <p className="mt-4 inline-block rounded bg-primary/20 px-2 py-1 text-xs text-primary">
          Deck: {post.deckName}
        </p>
      )}
      <div className="mt-6 whitespace-pre-wrap text-sm leading-6 text-foreground/80">
        {post.body || post.excerpt || "Příspěvek nemá text."}
      </div>
    </article>
  );
}