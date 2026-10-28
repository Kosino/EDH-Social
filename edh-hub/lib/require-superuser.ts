import { redirect } from "next/navigation";
import { isSuperuser } from "@/lib/admin";
import { getCurrentUser } from "@/lib/supabase/session";

/** Server-only: redirect guests to login, everyone else away from /admin. */
export async function requireSuperuser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!isSuperuser(user.username)) redirect("/");
  return user;
}
