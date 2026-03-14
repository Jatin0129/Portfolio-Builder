import { IntelligenceView } from "@/components/intelligence/intelligence-view";
import { getIntelligenceSnapshot } from "@/services/cycleos-service";

export default function IntelligencePage() {
  return <IntelligenceView snapshot={getIntelligenceSnapshot()} />;
}
