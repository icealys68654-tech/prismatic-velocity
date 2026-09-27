import { normalizeInput } from "./input-controller.js";
import { createRuntimeRenderer } from "./runtime-renderer.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function runPhase11_2Tests() {
  const input = normalizeInput({
    KeyW: true,
    KeyD: true,
    Space: true,
    KeyF: true,
    ShiftLeft: true,
  });
  assert(input.move === 1, "forward input must normalize to +1");
  assert(input.direction === 1, "right input must normalize to +1");
  assert(input.jump && input.attack && input.fire && input.boost, "action bindings must normalize");

  const repeatedA = normalizeInput({ KeyA: true, KeyS: true });
  const repeatedB = normalizeInput({ KeyA: true, KeyS: true });
  assert(JSON.stringify(repeatedA) === JSON.stringify(repeatedB), "identical input must normalize deterministically");

  const object = {
    position: {
      set(x, y, z) { this.value = { x, y, z }; },
    },
  };
  const camera = {
    position: {
      set(x, y, z) { this.value = { x, y, z }; },
    },
    lookAt(x, y, z) { this.target = { x, y, z }; },
  };
  const renderer = createRuntimeRenderer({ object, camera });
  const result = renderer.render({
    position: { x: 10, y: 20, z: 30 },
    forward: { x: 0, y: 0, z: 1 },
    route_index: 4,
    frame: 7,
  });

  assert(JSON.stringify(object.position.value) === JSON.stringify({ x: 10, y: 20, z: 30 }),
    "renderer bridge must project runtime position");
  assert(result.route_index === 4 && result.frame === 7, "renderer bridge must preserve runtime metadata");
  assert(camera.target.z === 55, "camera must follow runtime forward vector");

  return "Phase 11.2 tests passed";
}
