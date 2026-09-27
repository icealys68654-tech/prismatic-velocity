import { createPrismatics } from "../api/boa-api.js";

export function createBoaPrismaticsAdapter(backend) {
  const prismatics = createPrismatics(backend);
  return {
    id: "boa-prismatics",
    pitch(angle) { prismatics.pitch(angle); return this; },
    roll(angle) { prismatics.roll(angle); return this; },
    index(mapping) { prismatics.index(mapping); return this; },
    scatter(dataPoints) { prismatics.scatter(dataPoints); return this; },
    compute() { return prismatics.compute(); },
  };
}
