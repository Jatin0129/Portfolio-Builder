import { MarketFeedView } from "@/components/market-feed/market-feed-view";
import { getMarketFeedSnapshot } from "@/services/market-feed-service";

export default async function MarketFeedPage() {
  return <MarketFeedView snapshot={await getMarketFeedSnapshot()} />;
}
