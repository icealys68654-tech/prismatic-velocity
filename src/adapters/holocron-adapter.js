import { createHolocronRuntime } from "../api/holocron-api.js";

export function createHolocronAdapter({ core, video, input } = {}) {
  const runtime = createHolocronRuntime(core, video, input);
  return {
    id: "holocron-runtime",
    runtime,
    connect(element, inputTarget, options = {}) {
      return runtime.start({ ...options, element, inputTarget });
    },
    disconnect() { return runtime.stop(); },
    frame() { return runtime.frame(); },
    get state() { return runtime.state; },
  };
}
