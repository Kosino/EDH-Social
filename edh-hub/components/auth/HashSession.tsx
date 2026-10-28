"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function HashSession({ next, origin }: { next: string; origin: string }) {
  const [message, setMessage] = useState("Dokončuji přihlášení…");

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    const destination = `${origin}${next}`;
    const loginError = `${origin}/login?error=${encodeURIComponent("Odkaz pro přihlášení vypršel. Zkus to znovu.")}`;

    if (!accessToken || !refreshToken) {
      window.location.replace(loginError);
      return;
    }

    const supabase = createClient();
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          setMessage("Odkaz pro přihlášení vypršel. Zkus to znovu.");
          window.location.replace(loginError);
          return;
        }
        window.location.replace(destination);
      })
      .catch(() => {
        window.location.replace(loginError);
      });
  }, [next, origin]);

  return <p className="text-sm text-foreground/70">{message}</p>;
}
