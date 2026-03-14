import assert from "node:assert/strict";
import test from "node:test";

import { getAgentBundle } from "@/services/cycleos-service";

test("getAgentBundle still returns four compatible agent responses", async () => {
  const bundle = await getAgentBundle("NVDA");

  assert.ok(bundle);
  assert.equal(bundle?.length, 4);
  assert.deepEqual(
    bundle?.map((item) => item.agent),
    [
      "News Agent",
      "Macro/Geopolitics Agent",
      "Opportunity Agent",
      "Risk Officer Agent",
    ],
  );
});
