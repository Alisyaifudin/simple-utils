// client/share/elem$.ts
function elem$(component, state) {
  const effects = [];
  return {
    get get() {
      return component;
    },
    replaceWith(comp) {
      component.replaceWith(comp);
      component = comp;
      effects.forEach((effect) => effect(component, state));
    },
    replace(raw, querySelector) {
      const template = document.createElement("template");
      template.innerHTML = raw;
      let content = template.content.firstChild;
      if (querySelector) {
        content = template.content.querySelector(querySelector);
      } else if (component.id !== "") {
        const proposed = template.content.querySelector("#" + component.id);
        if (proposed !== null) content = proposed;
      }
      if (content === null) {
        console.error("No content", template.content);
        return;
      }
      component.replaceWith(content);
      component = content;
      effects.forEach((effect) => effect(component, state));
    },
    replaceInner(raw, querySelector) {
      var _a;
      const template = document.createElement("template");
      template.innerHTML = raw;
      let content = null;
      if (querySelector) {
        content = template.content.querySelector(querySelector);
      } else if (component.id !== "") {
        const proposed = template.content.querySelector("#" + component.id);
        if (proposed !== null) content = proposed;
      }
      component.innerHTML = (_a = content == null ? void 0 : content.outerHTML) != null ? _a : "";
      effects.forEach((effect) => effect(component, state));
    },
    replaceIfAny(raw, querySelector) {
      const template = document.createElement("template");
      template.innerHTML = raw;
      let content = null;
      if (querySelector) {
        content = template.content.querySelector(querySelector);
      } else if (component.id !== "") {
        const proposed = template.content.querySelector("#" + component.id);
        if (proposed !== null) content = proposed;
      }
      if (content === null) {
        return;
      }
      component.replaceWith(content);
      component = content;
      effects.forEach((effect) => effect(component, state));
    },
    set textContent(text) {
      component.textContent = text;
      effects.forEach((effect) => effect(component, state));
    },
    set outerHTML(raw) {
      component.outerHTML = raw;
      effects.forEach((effect) => effect(component, state));
    },
    set innerHTML(raw) {
      component.innerHTML = raw;
      effects.forEach((effect) => effect(component, state));
    },
    set state(s) {
      state = s;
      effects.forEach((effect) => effect(component, state));
    },
    set(transform, updateState) {
      component = transform(component);
      if (updateState !== void 0 && state !== void 0) {
        state = updateState(state);
      }
      effects.forEach((effect) => effect(component, state));
    },
    addEffect(effect, run = false) {
      effects.push(effect);
      if (run) {
        effect(component, state);
      }
    }
  };
}
export {
  elem$
};
//# sourceMappingURL=elem$.js.map
