import { headers } from "next/headers";
import { redirect } from "next/navigation";
import HashSession from "@/components/auth/HashSession";
import { browserOrigin, safeNext } from "@/lib/redirect";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  const origin = browserOrigin(host ? `${proto}://${host}` : null);
  const expired = `${origin}/login?error=${encodeURIComponent("Odkaz pro přihlášení vypršel. Zkus to znovu.")}`;

  if (!getSupabaseEnv()) {
    redirect(`${origin}/login?error=${encodeURIComponent("Chybí Supabase klíč.")}`);
  }

  if (params.error) redirect(expired);

  if (params.code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (!error) redirect(`${origin}${next}`);
    redirect(expired);
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold">Přihlášení</h1>
      <div className="mt-8 rounded-2xl border border-white/10 bg-card p-6">
        <HashSession next={next} origin={origin} />
      </div>
    </div>
  );
}
