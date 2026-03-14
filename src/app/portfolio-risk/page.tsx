import { PortfolioRiskView } from "@/components/portfolio/portfolio-risk-view";
import { getPortfolioSnapshot } from "@/services/cycleos-service";

export default async function PortfolioRiskPage() {
  const snapshot = await getPortfolioSnapshot();

  return <PortfolioRiskView snapshot={snapshot} />;
}
