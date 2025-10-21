type Effect<T extends Element, S = undefined> = S extends undefined
	? (comp: T, state?: undefined) => void
	: (comp: T, state: S) => void;

export type Elem$<T extends Element, S = undefined> = {
	readonly get: T;
	set(transform: (old: T) => T, updateState?: S extends undefined ? never : (old: S) => S): void;
	state: S;
	replaceWith(comp: T): void;
	replace(raw: string, querySelector?: string): void;
	replaceInner(raw: string, querySelector?: string): void;
	replaceIfAny(raw: string, querySelector?: string): void;
	innerHTML: string;
	textContent: string;
	outerHTML: string;
	addEffect(effect: Effect<T, S>, run?: boolean): void;
};

export function elem$<T extends Element, S = undefined>(component: T, state?: S): Elem$<T, S> {
	const effects: Effect<T, S>[] = [];
	return {
		get get() {
			return component;
		},
		replaceWith(comp) {
			component.replaceWith(comp);
			component = comp;
			effects.forEach((effect) => effect(component, state as any));
		},
		replace(raw, querySelector) {
			const template = document.createElement("template");
			template.innerHTML = raw;
			let content = template.content.firstChild as T | null;
			if (querySelector) {
				content = template.content.querySelector<T>(querySelector);
			} else if (component.id !== "") {
				const proposed = template.content.querySelector<T>("#" + component.id);
				if (proposed !== null) content = proposed;
			}
			if (content === null) {
				console.error("No content", template.content);
				return;
			}
			component.replaceWith(content);
			component = content;
			effects.forEach((effect) => effect(component, state as any));
		},
		replaceInner(raw, querySelector) {
			const template = document.createElement("template");
			template.innerHTML = raw;
			let content = null as null | Element;
			if (querySelector) {
				content = template.content.querySelector(querySelector);
			} else if (component.id !== "") {
				const proposed = template.content.querySelector("#" + component.id);
				if (proposed !== null) content = proposed;
			}
			component.innerHTML = content?.outerHTML ?? "";
			effects.forEach((effect) => effect(component, state as any));
		},
		replaceIfAny(raw, querySelector) {
			const template = document.createElement("template");
			template.innerHTML = raw;
			let content = null as null | T;
			if (querySelector) {
				content = template.content.querySelector<T>(querySelector);
			} else if (component.id !== "") {
				const proposed = template.content.querySelector<T>("#" + component.id);
				if (proposed !== null) content = proposed;
			}
			if (content === null) {
				return;
			}
			component.replaceWith(content);
			component = content;
			effects.forEach((effect) => effect(component, state as any));
		},
		set textContent(text: string) {
			component.textContent = text;
			effects.forEach((effect) => effect(component, state as any));
		},
		set outerHTML(raw: string) {
			component.outerHTML = raw;
			effects.forEach((effect) => effect(component, state as any));
		},
		set innerHTML(raw: string) {
			component.innerHTML = raw;
			effects.forEach((effect) => effect(component, state as any));
		},
		set state(s: S) {
			state = s;
			effects.forEach((effect) => effect(component, state as any));
		},
		set(transform, updateState) {
			component = transform(component);
			if (updateState !== undefined && state !== undefined) {
				state = updateState(state);
			}
			effects.forEach((effect) => effect(component, state as any));
		},
		addEffect(effect, run = false) {
			effects.push(effect);
			if (run) {
				effect(component, state as any);
			}
		},
	};
}
