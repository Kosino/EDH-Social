import Link from "next/link";
import DataNotice from "@/components/DataNotice";
import { getArticles, type FeedPost } from "@/lib/supabase/queries";
import { getCurrentUser } from "@/lib/supabase/session";
import { formatRelativePrague } from "@/lib/utils";

const samples: FeedPost[] = [
  {
    id: "sample-article-cedh",
    title: "Jak sestavit první cEDH deck",
    excerpt: "Mana base, stax vs combo a proč začít s jasným winconem.",
    body: null,
    deckName: null,
    kind: "article",
    authorId: "sample-author-3",
    author: "Kosino",
    authorUsername: "kosino",
    authorAvatarKey: "star-wizard",
    authorAvatarUrl: null,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sample-article-rules",
    title: "Pravidla stolu: rule zero bez dramatu",
    excerpt: "Jak si domluvit power level, tempo a očekávání před shuffles.",
    body: null,
    deckName: null,
    kind: "article",
    authorId: "sample-author-1",
    author: "AetherMaster",
    authorUsername: "aethermaster",
    authorAvatarKey: "forest-elf",
    authorAvatarUrl: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default async function ArticlesPage() {
  const [result, user] = await Promise.all([getArticles(), getCurrentUser()]);
  const live = result.status === "ok";
  const articles = live ? result.data : samples;
  const showSamples = !live;

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Články</h1>
          <p className="mt-1 text-foreground/60">Delší texty, primery a návody z komunity</p>
        </div>
        {user ? (
          <Link
            href="/articles/new"
            className="shrink-0 rounded-lg border border-accent px-4 py-2 text-sm font-medium text-accent hover:bg-accent/10"
          >
            + Nový článek
          </Link>
        ) : null}
      </div>

      {result.status === "error" && <DataNotice message={result.message} />}
      {result.status === "unconfigured" && (
        <DataNotice message="Supabase ještě není nastavené. Níže je jen náhled článků." />
      )}
      {showSamples && result.status === "error" ? (
        <p className="mb-4 text-sm text-foreground/50">Zatím ukazujeme ukázkové články.</p>
      ) : null}

      {live && articles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 bg-card/60 p-8 text-center text-sm text-foreground/70">
          Zatím žádné články.
          {user ? (
            <>
              {" "}
              <Link href="/articles/new" className="text-primary hover:underline">
                Napiš první
              </Link>
              .
            </>
          ) : (
            <> Přihlášení odemkne psaní článků.</>
          )}
        </p>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} live={live} />
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleCard({ article, live }: { article: FeedPost; live: boolean }) {
  const initial = article.author.slice(0, 1).toUpperCase();
  const profileHref =
    live && article.authorUsername !== "hráč" ? `/profile/${article.authorUsername}` : null;

  return (
    <article className="animate-fade-rise rounded-xl border border-white/10 bg-card p-5 transition hover:border-primary/40">
      <div className="mb-3 flex items-center gap-3 text-sm text-foreground/60">
        {profileHref ? (
          <Link
            href={profileHref}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-casual text-xs font-semibold text-white"
            aria-label={`Profil ${article.author}`}
          >
            {initial}
          </Link>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-casual text-xs font-semibold text-white">
            {initial}
          </div>
        )}
        <div className="min-w-0">
          {profileHref ? (
            <Link href={profileHref} className="font-medium text-foreground hover:text-primary hover:underline">
              {article.author}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{article.author}</span>
          )}
          <p className="text-xs text-foreground/45">{formatRelativePrague(article.createdAt)}</p>
        </div>
      </div>
      <h2 className="mb-2 font-display text-lg font-semibold">{article.title}</h2>
      {article.excerpt && <p className="mb-4 text-sm leading-relaxed text-foreground/70">{article.excerpt}</p>}
      {live ? (
        <Link href={`/articles/${article.id}`} className="text-xs font-medium text-primary hover:underline">
          Číst článek →
        </Link>
      ) : (
        <span className="text-xs text-foreground/40">Náhled</span>
      )}
    </article>
  );
}
