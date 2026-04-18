import { PortfolioRiskView } from "@/components/portfolio/portfolio-risk-view";
import { getMdbInvestmentsSnapshot } from "@/services/mdb-service";

export default async function PortfolioRiskPage() {
  const snapshot = await getMdbInvestmentsSnapshot();

  return <PortfolioRiskView snapshot={snapshot} />;
}
