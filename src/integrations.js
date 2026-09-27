import { createBOA, createCPUWorkflow, createPrismatics } from "./api/boa-api.js";
import { createFilterPipeline, createHolocronRuntime } from "./api/holocron-api.js";

export class BoaBigApiAdapter {
  constructor(options = {}) {
    this.options = options;
    this.workflow = options.workflow ?? createCPUWorkflow();
    this.boa = createBOA({ workflow: this.workflow, backend: options.backend });
    this.workflowState = { gameState: null, timestamp: null, frameIndex: 0 };
  }

  async gather(request) {
    const result = this.boa.execute(request);
    const payload = result?.payload ?? result;
    this.workflowState = {
      gameState: payload.gameState ?? request.gameState,
      timestamp: result?.timestamp ?? Date.now() / 1000,
      frameIndex: this.workflowState.frameIndex + 1,
    };
    return {
      adapter: "boa-bigapi-framework",
      status: "workflow-complete",
      result: payload,
      context: result,
    };
  }

  async compute(operation) {
    if (!this.boa.backend) throw new Error("No BOA compute backend configured");
    return {
      adapter: "boa-bigapi-framework",
      status: "compute-complete",
      result: this.boa.compute(operation),
    };
  }

  createPrismatics() {
    if (!this.boa.backend) throw new Error("No BOA compute backend configured");
    return createPrismatics(this.boa.backend);
  }
}

export class HolocronAbstractionAdapter {
  constructor(options = {}) {
    this.options = options;
    this.filters = createFilterPipeline();
    this.runtime = createHolocronRuntime(
      options.core ?? { start() {}, stop() {} },
      options.video ?? { connect() {}, disconnect() {} },
      options.input ?? { connect() {}, disconnect() {} },
    );
  }

  async abstract(request) {
    const filtered = this.filters.run({
      items: request.items ?? [],
      query: request.query ?? "",
    });
    return {
      adapter: "HOLOCRON-Abstraction-SDK",
      status: "runtime-ready",
      result: filtered,
      runtime_state: this.runtime.state,
    };
  }

  addFilter(filter) {
    this.filters.use(filter);
    return this;
  }

  start(config = {}) {
    return this.runtime.start(config);
  }

  stop() {
    return this.runtime.stop();
  }
}

export class IntegrationCoordinator {
  constructor(gameState = {}, options = {}) {
    this.gameState = gameState;
    this.boa = options.boa ?? new BoaBigApiAdapter(options);
    this.holocron = options.holocron ?? new HolocronAbstractionAdapter(options);
    this.lastResult = null;
  }

  async executeBoaWorkflow(request = {}) {
    this.lastResult = await this.boa.gather({
      gameState: this.gameState,
      ...request,
    });
    return this.lastResult;
  }

  async executeHolocronAbstraction(request = {}) {
    this.lastResult = await this.holocron.abstract(request);
    return this.lastResult;
  }

  getFrame() {
    return this.lastResult?.result || null;
  }

  getGameState() {
    return this.gameState;
  }

  updateGameState(updates) {
    this.gameState = { ...this.gameState, ...updates };
  }
}
