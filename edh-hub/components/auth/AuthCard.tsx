import Link from "next/link";
import TreeMark from "@/components/brand/TreeMark";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { missingSupabaseEnv } from "@/lib/supabase/env";

export default function AuthCard({
  title,
  subtitle,
  error,
  message,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  error?: string;
  message?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const missing = missingSupabaseEnv();
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = projectUrl?.match(/^https:\/\/([a-z0-9]+)\.supabase\.co\/?$/)?.[1];
  const keysHref = projectRef
    ? `https://supabase.com/dashboard/project/${projectRef}/settings/api`
    : "https://supabase.com/dashboard";

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 flex items-center gap-3">
        <TreeMark className="h-10 w-10 animate-mark-glow" />
        <div>
          <p className="font-display text-lg font-bold">{BRAND_NAME}</p>
          <p className="text-xs text-foreground/50">{BRAND_TAGLINE}</p>
        </div>
      </div>
      <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-1 text-foreground/60">{subtitle}</p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-card/95 p-6 shadow-panel">
        {missing.length > 0 && (
          <p className="mb-4 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">
            {missing.includes("url")
              ? "Chybí NEXT_PUBLIC_SUPABASE_URL."
              : `Projekt je napojený na ${projectUrl}, ale chybí publishable klíč. V Supabase otevři Project Settings → API a vlož ho do edh-hub/.env.local jako NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.`}{" "}
            <Link href={keysHref} className="underline">
              Otevřít API keys
            </Link>
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-lg border border-red-400/40 bg-red-400/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
        {message && (
          <p className="mb-4 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
            {message}
          </p>
        )}
        {children}
      </div>

      <div className="mt-4 text-sm text-foreground/70">{footer}</div>
    </div>
  );
}
