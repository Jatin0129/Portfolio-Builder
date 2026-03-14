import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getAgentBundle, getDashboardSnapshot } from "@/services/cycleos-service";

export default function DashboardPage() {
  const snapshot = getDashboardSnapshot();
  const agentBundles = Object.fromEntries(
    snapshot.topTradeIdeas.map((idea) => [idea.ticker, getAgentBundle(idea.ticker) ?? []]),
  );

  return <DashboardView agentBundles={agentBundles} snapshot={snapshot} />;
}
