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
      <div className="max-w-3xl">
        <DataNotice message={result.message} />
        <Link href="/articles" className="text-sm text-primary hover:underline">
          Zpět na články
        </Link>
      </div>
    );
  }

  if (result.status !== "ok" || !result.data || result.data.kind !== "article") notFound();

  const article = result.data;

  return (
    <article className="max-w-3xl">
      <Link href="/articles" className="text-sm text-primary hover:underline">
        ← Články
      </Link>
      <div className="mb-6 mt-4 flex items-center gap-3 text-sm text-foreground/60">
        <div className="h-8 w-8 rounded-full bg-primary/30" />
        {article.authorUsername !== "hráč" ? (
          <Link href={`/profile/${article.authorUsername}`} className="hover:text-primary hover:underline">
            {article.author}
          </Link>
        ) : (
          <span>{article.author}</span>
        )}
        <span>•</span>
        <span>{formatRelativePrague(article.createdAt)}</span>
      </div>
      <h1 className="text-3xl font-bold">{article.title}</h1>
      <div className="mt-6 whitespace-pre-wrap text-sm leading-6 text-foreground/80">
        {article.body || article.excerpt || "Článek nemá text."}
      </div>
    </article>
  );
}
