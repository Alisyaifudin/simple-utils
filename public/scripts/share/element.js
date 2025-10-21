// client/share/element.ts
function getElement(selectors, root = document) {
  const el = root.querySelector(selectors);
  if (el === null) throw new Error("Element not found: " + selectors);
  return el;
}
export {
  getElement
};
//# sourceMappingURL=element.js.map
