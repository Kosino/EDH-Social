"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  parseAvatarKey,
  parseDisplayName,
  parseMoxfieldUserUrl,
  parseProfileBio,
} from "@/lib/profile/validate";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";

export type ProfileFormState = { error: string } | null;

async function requireOwner(): Promise<
  { ok: true; user: { id: string; username: string } } | { ok: false; error: string }
> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile/me");
  if (!user.username) {
    return { ok: false, error: "Profil se ještě nezaložil. Odhlás se a přihlas znovu." };
  }
  return { ok: true, user: { id: user.id, username: user.username } };
}

export async function updateBio(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const auth = await requireOwner();
  if (!auth.ok) return { error: auth.error };
  const { user } = auth;

  const parsed = parseProfileBio(formData.get("bio"));
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

export async function updateProfileSettings(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const auth = await requireOwner();
  if (!auth.ok) return { error: auth.error };
  const { user } = auth;

  const display = parseDisplayName(formData.get("displayName"));
  if (!display.ok) return { error: display.error };
  const bio = parseProfileBio(formData.get("bio"));
  if (!bio.ok) return { error: bio.error };
  const avatar = parseAvatarKey(formData.get("avatarKey"));
  if (!avatar.ok) return { error: avatar.error };
  const moxfield = parseMoxfieldUserUrl(formData.get("moxfieldUserUrl"));
  if (!moxfield.ok) return { error: moxfield.error };

  const clearCustom = formData.get("clearCustomAvatar") === "1";
  const patch: Record<string, string | null> = {
    display_name: display.displayName,
    bio: bio.bio,
    avatar_key: avatar.avatarKey,
    moxfield_user_url: moxfield.url,
  };
  if (avatar.avatarKey) {
    patch.avatar_url = null;
  } else if (clearCustom) {
    patch.avatar_url = null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("updateProfileSettings", error?.code, error?.message);
    if (error?.message?.toLowerCase().includes("avatar_key") || error?.code === "42703") {
      return {
        error:
          "Chybí sloupce profilu. V Supabase SQL spusť supabase/migrations/20261028170000_profile_avatars.sql.",
      };
    }
    return { error: "Uložení profilu se nepovedlo. Zkus to znovu." };
  }

  revalidatePath(`/profile/${user.username}`);
  revalidatePath("/feed");
  redirect(`/profile/${user.username}`);
}

export async function saveCustomAvatarUrl(publicUrl: string): Promise<ProfileFormState> {
  const auth = await requireOwner();
  if (!auth.ok) return { error: auth.error };
  const { user } = auth;

  if (!publicUrl.startsWith("https://")) {
    return { error: "Neplatná URL nahraného obrázku." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl, avatar_key: null })
    .eq("id", user.id);

  if (error) {
    console.error("saveCustomAvatarUrl", error.code, error.message);
    return { error: "Uložení nahraného avataru se nepovedlo." };
  }

  revalidatePath(`/profile/${user.username}`);
  return null;
}
