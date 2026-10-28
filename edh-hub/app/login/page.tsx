import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import SubmitButton from "@/components/auth/SubmitButton";
import { login } from "@/app/auth/actions";
import { safeNext } from "@/lib/redirect";
import { getCurrentUser } from "@/lib/supabase/session";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const user = await getCurrentUser();
  if (user) redirect(next);
  const signupHref = next === "/" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`;

  return (
    <AuthCard
      title="Přihlášení"
      subtitle="Vrať se ke svým deckům a eventům."
      error={params.error}
      message={params.message}
      footer={
        <>
          Nemáš účet?{" "}
          <Link href={signupHref} className="text-primary hover:underline">
            Zaregistruj se
          </Link>
        </>
      }
    >
      <form action={login} className="space-y-4">
        <input type="hidden" name="next" value={next} />
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
            autoComplete="current-password"
            minLength={6}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <SubmitButton label="Přihlásit se" />
      </form>
    </AuthCard>
  );
}
