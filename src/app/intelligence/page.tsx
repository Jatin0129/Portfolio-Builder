import { IntelligenceView } from "@/components/intelligence/intelligence-view";
import { getIntelligenceSnapshot } from "@/services/cycleos-service";

export default async function IntelligencePage() {
  return <IntelligenceView snapshot={await getIntelligenceSnapshot()} />;
}
