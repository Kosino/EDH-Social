import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import SubmitButton from "@/components/auth/SubmitButton";
import { signup } from "@/app/auth/actions";
import { safeNext } from "@/lib/redirect";
import { getCurrentUser } from "@/lib/supabase/session";
import { redirect } from "next/navigation";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const user = await getCurrentUser();
  if (user) redirect(next);
  const loginHref = next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

  return (
    <AuthCard
      title="Registrace"
      subtitle="Účet pro feed, decky a eventy."
      error={params.error}
      message={params.message}
      footer={
        <>
          Už účet máš?{" "}
          <Link href={loginHref} className="text-primary hover:underline">
            Přihlas se
          </Link>
        </>
      }
    >
      <form action={signup} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="username" className="mb-1.5 block text-sm">
            Uživatelské jméno
          </label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            minLength={3}
            maxLength={20}
            pattern="[A-Za-z0-9_]{3,20}"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <p className="mt-1 text-xs text-foreground/50">3–20 znaků. Uloží se malými písmeny.</p>
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm">
            Heslo
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <SubmitButton label="Vytvořit účet" />
      </form>
    </AuthCard>
  );
}
