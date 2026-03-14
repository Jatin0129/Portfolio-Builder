import { holdings, watchlist } from "@/mock-data/portfolio";
import type { PortfolioProvider } from "@/providers/interfaces";

export const mockPortfolioProvider: PortfolioProvider = {
  getHoldings() {
    // TODO: replace with broker portfolio sync adapter.
    return holdings;
  },
  getWatchlist() {
    return watchlist;
  },
};
