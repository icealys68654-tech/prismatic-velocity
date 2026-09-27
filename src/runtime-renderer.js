export function createRuntimeRenderer({ object, camera, lookAhead = 25 } = {}) {
  if (!object) throw new Error("createRuntimeRenderer requires a render object");

  return {
    render(state) {
      if (!state?.position) return null;

      object.position.set(state.position.x, state.position.y, state.position.z);

      if (camera && state.forward) {
        camera.position.set(
          state.position.x - state.forward.x * 15,
          state.position.y + 6,
          state.position.z - state.forward.z * 15,
        );
        camera.lookAt(
          state.position.x + state.forward.x * lookAhead,
          state.position.y,
          state.position.z + state.forward.z * lookAhead,
        );
      }

      return {
        position: { ...state.position },
        route_index: state.route_index,
        frame: state.frame,
      };
    },
  };
}
