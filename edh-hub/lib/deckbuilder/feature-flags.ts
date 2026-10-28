import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export type FeatureFlagKey = "deckbuilder_core" | "deckbuilder_import" | "deckbuilder_stats" | string;

/**
 * Read a feature flag. Fail-closed (false) when Supabase missing or row absent,
 * except we treat missing `deckbuilder_core` as false so legacy decks keep working
 * until the Taverna migration is applied.
 */
export async function isFeatureEnabled(key: FeatureFlagKey): Promise<boolean> {
  if (!getSupabaseEnv()) return false;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("feature_flags")
      .select("enabled")
      .eq("key", key)
      .maybeSingle();

    if (error) {
      // Table may not exist yet (migration not run).
      if (error.code === "PGRST205" || error.code === "42P01" || error.message?.includes("feature_flags")) {
        return false;
      }
      console.error("feature flag", key, error.code, error.message);
      return false;
    }

    return Boolean(data?.enabled);
  } catch (err) {
    console.error("feature flag lookup failed", key, err);
    return false;
  }
}
