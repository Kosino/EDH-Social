import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAdminOverview } from "@/lib/supabase/admin-queries";
import { getSupabaseEnv } from "@/lib/supabase/env";

/** Local/visual preview of admin chrome (not linked in nav). */
export default async function AdminPreviewPage() {
  const overview = await getAdminOverview();
  return (
    <AdminDashboard username="kosino" overview={overview} envOk={Boolean(getSupabaseEnv())} />
  );
}
