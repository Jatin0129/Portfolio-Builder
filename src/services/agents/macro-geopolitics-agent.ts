import {
  macroGeopoliticsAgentEnvelopeSchema,
  macroGeopoliticsAgentRequestSchema,
  type MacroGeopoliticsAgentRequest,
  type MacroGeopoliticsAgentResponse,
} from "@/schemas/agents";
import {
  buildRequestId,
  createMockEnvelope,
  normalizeScore,
  type TypedAgentService,
} from "@/services/agents/shared";

export const invokeMacroGeopoliticsAgent: TypedAgentService<
  MacroGeopoliticsAgentRequest,
  MacroGeopoliticsAgentResponse
> = (request) => {
  const parsedRequest = macroGeopoliticsAgentRequestSchema.parse(request);
  const dominantMacroSignal = [...parsedRequest.macroSignals].sort(
    (left, right) => normalizeScore(right.importance, 50) - normalizeScore(left.importance, 50),
  )[0];
  const dominantGeopoliticalEvent = [...parsedRequest.geopoliticalEvents].sort((left, right) => {
    const order = { Low: 1, Moderate: 2, High: 3, Critical: 4 };
    return order[right.severity] - order[left.severity];
  })[0];

  const regimeLabel =
    parsedRequest.regimeContext?.currentRegime ??
    parsedRequest.regimeContext?.posture ??
    "balanced regime";

  const status =
    dominantGeopoliticalEvent.severity === "Critical" || dominantGeopoliticalEvent.severity === "High"
      ? "watch"
      : "ok";

  const response = createMockEnvelope(
    "Macro/Geopolitics Agent",
    buildRequestId("Macro/Geopolitics Agent", [
      dominantMacroSignal.label,
      dominantGeopoliticalEvent.region,
    ]),
    status,
    {
      macroInterpretation: `${dominantMacroSignal.label} is the main macro driver, with a ${dominantMacroSignal.trend} trend shaping cross-asset tone.`,
      geopoliticalInterpretation: `${dominantGeopoliticalEvent.title} is the key geopolitical overlay for ${dominantGeopoliticalEvent.region}, primarily transmitting through ${dominantGeopoliticalEvent.channels.join(", ")}.`,
      regimeImplications: `In the current ${regimeLabel}, this mix argues for selective risk-taking and tighter monitoring of policy and headline sensitivity.`,
    },
  );

  return macroGeopoliticsAgentEnvelopeSchema.parse(response);
};
