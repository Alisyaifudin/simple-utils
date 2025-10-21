// client/share/state$.ts
function state$(state) {
  const effects = [];
  return {
    get get() {
      return state;
    },
    set set(v) {
      state = v;
      effects.forEach((effect) => effect(v));
    },
    setter(func) {
      state = func(state);
      effects.forEach((effect) => effect(state));
    },
    addEffect(effect, run = false) {
      effects.push(effect);
      if (run) effect(state);
    }
  };
}
export {
  state$
};
//# sourceMappingURL=state$.js.map
