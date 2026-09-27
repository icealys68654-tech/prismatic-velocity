/**
 * Prismatic Velocity's browser-side projection of the HOLOCRON public API.
 * Mirrors FilterPipeline and HolocronRuntime contracts.
 */

export function createFilterPipeline(filters = []) {
  const pipeline = [...filters];

  const sorted = () => [...pipeline].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999) || String(a.id ?? "").localeCompare(String(b.id ?? "")),
  );

  return {
    use(filter) {
      if (!filter || typeof filter.apply !== "function") {
        throw new TypeError("Filter must expose apply(items, query)");
      }
      pipeline.push(filter);
      return this;
    },
    run({ items = [], query = "" } = {}) {
      return sorted().reduce((current, filter) => filter.apply(current, query), [...items]);
    },
    filters: pipeline,
  };
}

export function createHolocronRuntime(core, video, input) {
  if (!core || !video || !input) {
    throw new TypeError("HolocronRuntime requires core, video, and input connectors");
  }

  let state = "stopped";
  return {
    core,
    video,
    input,
    get state() {
      return state;
    },
    start(options = {}) {
      state = "running";
      if (typeof core.start === "function") core.start(options);
      if (typeof video.connect === "function" && options.element) video.connect(options.element);
      if (typeof input.connect === "function" && options.inputTarget) input.connect(options.inputTarget);
      return { status: "runtime-started", options };
    },
    stop() {
      if (typeof input.disconnect === "function") input.disconnect();
      if (typeof video.disconnect === "function") video.disconnect();
      if (typeof core.stop === "function") core.stop();
      state = "stopped";
      return { status: "runtime-stopped" };
    },
  };
}
