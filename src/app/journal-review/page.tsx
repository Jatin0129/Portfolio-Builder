import { JournalReviewView } from "@/components/journal/journal-review-view";
import { getMdbJournalSnapshot } from "@/services/mdb-service";

export default async function JournalReviewPage() {
  return <JournalReviewView snapshot={await getMdbJournalSnapshot()} />;
}
