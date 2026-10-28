import Link from "next/link";
import { redirect } from "next/navigation";
import PostForm from "@/components/forms/PostForm";
import { getCurrentUser } from "@/lib/supabase/session";

export default async function NewArticlePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/articles/new");

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/articles" className="text-sm text-primary hover:underline">
        ← Články
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Nový článek</h1>
      <p className="mt-1 text-foreground/60">
        Delší text pro sekci Články. Autor: {user.username ?? "ty"}.
      </p>
      <PostForm kind="article" />
    </div>
  );
}