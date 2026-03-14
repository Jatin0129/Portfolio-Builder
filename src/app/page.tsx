import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getDashboardSnapshot } from "@/services/cycleos-service";

export default function DashboardPage() {
  const snapshot = getDashboardSnapshot();

  return <DashboardView snapshot={snapshot} />;
}
