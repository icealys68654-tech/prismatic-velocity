/**
 * Prismatic Velocity's browser-side projection of the BOA public API.
 * Mirrors BOAContext, CPUWorkflow/BOA, and Prismatics contracts without
 * coupling the browser runtime to BOA's Python implementation.
 */

export function createBOAContext(payload, metadata = {}) {
  return {
    payload,
    request_id: crypto.randomUUID ? crypto.randomUUID() : `pv-${Date.now()}`,
    timestamp: Date.now() / 1000,
    metadata: { ...metadata },
  };
}

export function createCPUWorkflow(components = []) {
  const pipeline = [...components];

  return {
    use(component) {
      if (!component || typeof component.process !== "function") {
        throw new TypeError("Workflow components must expose process(data)");
      }
      pipeline.push(component);
      return this;
    },
    execute(data) {
      let context = data?.payload !== undefined && data?.request_id
        ? data
        : createBOAContext(data);
      for (const component of pipeline) {
        const result = component.process(context.payload);
        context = {
          ...context,
          payload: result,
        };
      }
      return context;
    },
    components: pipeline,
  };
}

export function createBOA({ workflow = createCPUWorkflow(), backend = null } = {}) {
  return {
    workflow,
    backend,
    execute(data) {
      return workflow.execute(data);
    },
    compute(operation) {
      if (!backend || typeof backend.execute !== "function") {
        throw new Error("No compute backend configured");
      }
      return backend.execute(operation);
    },
  };
}

export function createPrismatics(backend) {
  if (!backend || typeof backend.execute !== "function") {
    throw new TypeError("Prismatics requires a backend.execute(operations) contract");
  }

  const operations = [];
  const api = {
    pitch(rotation_angle) {
      operations.push(["pitch", rotation_angle]);
      return api;
    },
    roll(rotation_angle) {
      operations.push(["roll", rotation_angle]);
      return api;
    },
    index(mapping) {
      operations.push(["index", mapping]);
      return api;
    },
    scatter(data_points) {
      operations.push(["scatter", data_points]);
      return api;
    },
    compute() {
      return backend.execute([...operations]);
    },
  };
  return api;
}
