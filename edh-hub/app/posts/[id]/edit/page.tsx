import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import PostForm from "@/components/forms/PostForm";
import { getPost } from "@/lib/supabase/queries";
import { getCurrentUser } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/posts/${id}/edit`)}`);

  const result = await getPost(id);
  if (result.status === "error") {
    return (
      <div className="mx-auto max-w-xl">
        <DataNotice message={result.message} />
      </div>
    );
  }
  if (result.status !== "ok" || !result.data) notFound();
  if (result.data.kind === "article") redirect(`/articles/${id}/edit`);
  if (result.data.authorId !== user.id) redirect(`/posts/${id}`);

  const post = result.data;

  return (
    <div className="mx-auto max-w-xl">
      <Link href={`/posts/${id}`} className="text-sm text-primary hover:underline">
        ← Zpět na příspěvek
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold">Upravit příspěvek</h1>
      <PostForm
        mode="edit"
        postId={post.id}
        kind="post"
        defaults={{
          title: post.title,
          body: post.body ?? "",
          excerpt: post.excerpt ?? "",
          deckName: post.deckName,
        }}
      />
    </div>
  );
}
