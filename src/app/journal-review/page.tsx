import { JournalReviewView } from "@/components/journal/journal-review-view";
import { getReviewSnapshot } from "@/services/cycleos-service";

export default async function JournalReviewPage() {
  return <JournalReviewView snapshot={await getReviewSnapshot()} />;
}
