import { geopoliticalEvents } from "@/mock-data/geopolitics";
import type { GeopoliticsProvider } from "@/providers/interfaces";

export const mockGeopoliticsProvider: GeopoliticsProvider = {
  getGeopoliticalEvents() {
    // TODO: replace with live geopolitical monitoring feeds.
    return geopoliticalEvents;
  },
};
