/**
 * Browser-side projection of the linked HOLOCRON Abstraction SDK.
 * The linked SDK's Filter contract is run(items, ctx), and Connector contracts
 * expose connect/disconnect. Runtime lifecycle remains host-owned.
 */
export function createFilterPipeline(filters = []) {
  const pipeline = [...filters];
  const sorted = () => [...pipeline].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999) ||
      String(a.id ?? "").localeCompare(String(b.id ?? "")),
  );
  return {
    use(filter) {
      if (!filter || typeof filter.run !== "function") {
        throw new TypeError("Filter must expose run(items, ctx)");
      }
      pipeline.push(filter);
      return this;
    },
    run({ items = [], query = "" } = {}) {
      return sorted().reduce(
        (current, filter) => filter.run(current, { query }),
        [...items],
      );
    },
    filters: pipeline,
  };
}
export function createHolocronRuntime(core, video, input) {
  if (!core || !video || !input) throw new TypeError("HolocronRuntime requires core, video, and input connectors");
  let state = "stopped";
  return {
    core, video, input,
    get state() { return state; },
    start(options = {}) {
      state = "running";
      if (typeof video.connect === "function" && options.element) video.connect(options.element, options.videoConfig);
      if (typeof input.connect === "function" && options.inputTarget) input.connect(options.inputTarget, options.inputConfig);
      return { status: "runtime-started", options };
    },
    stop() {
      if (typeof input.disconnect === "function") input.disconnect();
      if (typeof video.disconnect === "function") video.disconnect();
      state = "stopped";
      return { status: "runtime-stopped" };
    },
    frame() {
      if (state !== "running") return null;
      if (typeof core.runFrame === "function") core.runFrame();
      return typeof core.getFramebuffer === "function" ? core.getFramebuffer() : null;
    },
  };
}
