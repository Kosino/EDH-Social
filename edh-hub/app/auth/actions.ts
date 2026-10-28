"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { safeNext } from "@/lib/redirect";

const USERNAME = /^[A-Za-z0-9_]{3,20}$/;

function redirectWith(path: string, key: "error" | "message", value: string, next = "/"): never {
  const params = new URLSearchParams();
  if (next !== "/") params.set("next", next);
  params.set(key, value.slice(0, 240));
  redirect(`${path}?${params}`);
}

function authError(message: string): string {
  if (message.includes("Invalid login credentials")) return "Neplatný e-mail nebo heslo.";
  if (message.includes("Email not confirmed")) return "Nejdřív potvrď e-mail.";
  if (message.includes("already registered") || message.includes("already been registered")) {
    return "Účet s tímto e-mailem už existuje.";
  }
  return message;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function login(formData: FormData) {
  if (!getSupabaseEnv()) {
    redirectWith(
      "/login",
      "error",
      "Chybí Supabase klíč. Doplň NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY do .env.local."
    );
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/"));

  if (!isEmail(email) || password.length < 6) {
    redirectWith("/login", "error", "Zadej platný e-mail a heslo (alespoň 6 znaků).", next);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirectWith("/login", "error", authError(error.message), next);

  redirect(next);
}

export async function signup(formData: FormData) {
  if (!getSupabaseEnv()) {
    redirectWith(
      "/signup",
      "error",
      "Chybí Supabase klíč. Doplň NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY do .env.local."
    );
  }

  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/"));

  if (!USERNAME.test(username)) {
    redirectWith("/signup", "error", "Uživatelské jméno: 3–20 znaků, jen písmena, čísla a podtržítko.", next);
  }
  if (!isEmail(email) || password.length < 6) {
    redirectWith("/signup", "error", "Zadej platný e-mail a heslo (alespoň 6 znaků).", next);
  }

  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existingError) {
    if (existingError.code === "PGRST205" || existingError.code === "42P01") {
      redirectWith(
        "/signup",
        "error",
        "Tabulky ještě neexistují. V SQL editoru spusť supabase/migrations/20261028100000_init.sql.",
        next
      );
    }
    redirectWith("/signup", "error", "Registraci se nepodařilo ověřit. Zkus to znovu.", next);
  }

  if (existing) {
    redirectWith("/signup", "error", "Tohle uživatelské jméno už někdo používá.", next);
  }

  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) redirectWith("/signup", "error", authError(error.message), next);

  if (!data.session) {
    redirectWith("/signup", "message", "Zkontroluj e-mail a potvrď účet. Pak se můžeš přihlásit.", next);
  }

  redirect(next);
}

export async function signOut() {
  if (getSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
