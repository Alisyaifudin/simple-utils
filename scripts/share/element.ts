export function getElement<E extends Element = Element>(
	selectors: string,
	root: Element | Document = document
): E {
	const el = root.querySelector<E>(selectors);
	if (el === null) throw new Error("Element not found: " + selectors);
	return el;
}
