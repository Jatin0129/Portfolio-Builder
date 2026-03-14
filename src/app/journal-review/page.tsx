import { JournalReviewView } from "@/components/journal/journal-review-view";
import { getReviewSnapshot } from "@/services/cycleos-service";

export default function JournalReviewPage() {
  return <JournalReviewView snapshot={getReviewSnapshot()} />;
}
