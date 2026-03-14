import { PortfolioRiskView } from "@/components/portfolio/portfolio-risk-view";
import { getPortfolioSnapshot } from "@/services/cycleos-service";

export default function PortfolioRiskPage() {
  const snapshot = getPortfolioSnapshot();

  return <PortfolioRiskView snapshot={snapshot} />;
}
