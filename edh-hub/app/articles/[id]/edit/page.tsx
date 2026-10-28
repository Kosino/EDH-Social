import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import PostForm from "@/components/forms/PostForm";
import { getPost } from "@/lib/supabase/queries";
import { getCurrentUser } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/articles/${id}/edit`)}`);

  const result = await getPost(id);
  if (result.status === "error") {
    return (
      <div className="mx-auto max-w-xl">
        <DataNotice message={result.message} />
      </div>
    );
  }
  if (result.status !== "ok" || !result.data || result.data.kind !== "article") notFound();
  if (result.data.authorId !== user.id) redirect(`/articles/${id}`);

  const article = result.data;

  return (
    <div className="mx-auto max-w-xl">
      <Link href={`/articles/${id}`} className="text-sm text-primary hover:underline">
        ← Zpět na článek
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold">Upravit článek</h1>
      <PostForm
        mode="edit"
        postId={article.id}
        kind="article"
        defaults={{
          title: article.title,
          body: article.body ?? "",
          excerpt: article.excerpt ?? "",
        }}
      />
    </div>
  );
}
