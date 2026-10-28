import Link from "next/link";
import { redirect } from "next/navigation";
import PostForm from "@/components/forms/PostForm";
import { getCurrentUser } from "@/lib/supabase/session";

export default async function NewPostPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/posts/new");

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/" className="text-sm text-primary hover:underline">
        ← Feed
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Nový příspěvek</h1>
      <p className="mt-1 text-foreground/60">Ukáže se ve feedu jako {user.username ?? "ty"}.</p>
      <PostForm />
    </div>
  );
}
