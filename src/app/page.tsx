import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getMdbOverviewSnapshot } from "@/services/mdb-service";

export default async function DashboardPage() {
  const snapshot = await getMdbOverviewSnapshot();

  return <DashboardView snapshot={snapshot} />;
}
