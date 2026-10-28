export type SupabaseEnv = {
  url: string;
  key: string;
};

function present(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!present(url) || !present(key)) return null;
  return { url: url.trim(), key: key.trim() };
}

export function missingSupabaseEnv(): Array<"url" | "key"> {
  const missing: Array<"url" | "key"> = [];
  if (!present(process.env.NEXT_PUBLIC_SUPABASE_URL)) missing.push("url");
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!present(key)) missing.push("key");
  return missing;
}
