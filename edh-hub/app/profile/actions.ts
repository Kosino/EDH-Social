"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseBio } from "@/lib/profile/bio";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";

export type BioFormState = { error: string } | null;

export async function updateBio(_prev: BioFormState, formData: FormData): Promise<BioFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile/me");
  if (!user.username) {
    return { error: "Profil se ještě nezaložil. Odhlás se a přihlas znovu." };
  }

  const parsed = parseBio(formData.get("bio"));
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ bio: parsed.bio })
    .eq("id", user.id)
    .select("bio")
    .maybeSingle();

  if (error || !data) {
    console.error("updateBio", error?.code, error?.message);
    return { error: "Uložení popisu se nepovedlo. Zkus to znovu." };
  }

  revalidatePath(`/profile/${user.username}`);
  redirect(`/profile/${user.username}`);
}
