export function createPlayerController({ speed = 1, jumpImpulse = 1, maxStamina = 100 } = {}) {
  let velocity = { x: 0, y: 0 };
  let grounded = true;
  let stamina = maxStamina;

  return {
    step(input = {}) {
      const axis = Number(input.direction ?? 0);
      const forward = Number(input.move ?? input.forward ?? 0);
      const jump = Boolean(input.jump);

      velocity.x = Math.max(-1, Math.min(1, axis)) * speed;
      velocity.y = jump && grounded && stamina >= 8 ? jumpImpulse : 0;

      if (velocity.y > 0) {
        grounded = false;
        stamina = Math.max(0, stamina - 8);
      } else {
        grounded = true;
        stamina = Math.min(maxStamina, stamina + 2);
      }

      return {
        axis,
        forward: Math.max(-1, Math.min(1, forward)),
        velocity: { ...velocity },
        grounded,
        stamina,
      };
    },
    getState() {
      return { velocity: { ...velocity }, grounded, stamina };
    },
  };
}
