import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export type SessionUser = {
  id: string;
  email: string;
  username: string | null;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  if (!getSupabaseEnv()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;

  const id = data.claims.sub;
  const email = typeof data.claims.email === "string" ? data.claims.email : "";

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", id)
    .maybeSingle();

  if (profileError) {
    console.error("Profile lookup failed", profileError.code, profileError.message);
  }

  const username =
    profile && typeof profile.username === "string" ? profile.username : null;

  return { id, email, username };
}
