import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { requireSuperuser } from "@/lib/require-superuser";
import { getAdminOverview } from "@/lib/supabase/admin-queries";
import { getSupabaseEnv } from "@/lib/supabase/env";

export default async function AdminDashboardPage() {
  const user = await requireSuperuser();
  const overview = await getAdminOverview();

  return (
    <AdminDashboard
      username={user.username ?? "kosino"}
      overview={overview}
      envOk={Boolean(getSupabaseEnv())}
    />
  );
}
