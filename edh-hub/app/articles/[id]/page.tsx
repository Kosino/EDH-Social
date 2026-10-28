import Link from "next/link";
import { notFound } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import { getPost } from "@/lib/supabase/queries";
import { formatRelativePrague } from "@/lib/utils";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getPost(id);

  if (result.status === "error") {
    return (
      <div className="mx-auto max-w-3xl">
        <DataNotice message={result.message} />
        <Link href="/articles" className="text-sm text-primary hover:underline">
          Zpět na články
        </Link>
      </div>
    );
  }

  if (result.status !== "ok" || !result.data || result.data.kind !== "article") notFound();

  const article = result.data;
  const initial = article.author.slice(0, 1).toUpperCase();

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/articles" className="text-sm text-primary hover:underline">
        ← Články
      </Link>
      <div className="mb-6 mt-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-casual text-sm font-semibold text-white ring-2 ring-primary/30">
          {initial}
        </div>
        <div>
          {article.authorUsername !== "hráč" ? (
            <Link
              href={`/profile/${article.authorUsername}`}
              className="font-medium text-foreground hover:text-primary"
            >
              {article.author}
            </Link>
          ) : (
            <span className="font-medium">{article.author}</span>
          )}
          <p className="text-xs text-foreground/45">{formatRelativePrague(article.createdAt)}</p>
        </div>
      </div>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-accent">Článek</p>
      <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{article.title}</h1>
      <div className="mt-8 whitespace-pre-wrap rounded-2xl border border-white/10 bg-card p-6 text-sm leading-7 text-foreground/80 sm:p-8 sm:text-[15px]">
        {article.body || article.excerpt || "Článek nemá text."}
      </div>
    </article>
  );
}
