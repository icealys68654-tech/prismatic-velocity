const KEY_BINDINGS = Object.freeze({
  left: ["ArrowLeft", "KeyA"],
  right: ["ArrowRight", "KeyD"],
  forward: ["ArrowUp", "KeyW"],
  backward: ["ArrowDown", "KeyS"],
  jump: ["Space"],
  action: ["KeyF", "Enter"],
  boost: ["ShiftLeft", "ShiftRight"],
  reset: ["KeyR"],
});

function pressed(keys, names) {
  return names.some((name) => Boolean(keys[name]));
}

export function normalizeInput(keys = {}) {
  const left = pressed(keys, KEY_BINDINGS.left);
  const right = pressed(keys, KEY_BINDINGS.right);
  const forward = pressed(keys, KEY_BINDINGS.forward);
  const backward = pressed(keys, KEY_BINDINGS.backward);

  return Object.freeze({
    direction: Number(right) - Number(left),
    move: Number(forward) - Number(backward),
    jump: pressed(keys, KEY_BINDINGS.jump),
    attack: pressed(keys, KEY_BINDINGS.action),
    fire: pressed(keys, KEY_BINDINGS.action),
    boost: pressed(keys, KEY_BINDINGS.boost),
    reset: pressed(keys, KEY_BINDINGS.reset),
  });
}

export function createInputController(target = globalThis) {
  const keys = Object.create(null);
  const onKeyDown = (event) => { keys[event.code] = true; };
  const onKeyUp = (event) => { keys[event.code] = false; };

  target?.addEventListener?.("keydown", onKeyDown);
  target?.addEventListener?.("keyup", onKeyUp);

  return {
    read() {
      return normalizeInput(keys);
    },
    getKeys() {
      return { ...keys };
    },
    dispose() {
      target?.removeEventListener?.("keydown", onKeyDown);
      target?.removeEventListener?.("keyup", onKeyUp);
    },
  };
}
