type Effect<T> = (state: T) => void;

export type State$<T> = {
	readonly get: T;
	set: T;
	addEffect(effect: Effect<T>, run?: boolean): void;
};

export function state$<T>(state: T): State$<T> {
	const effects: Effect<T>[] = [];
	return {
		get get() {
			return state;
		},
		set set(v: T) {
			state = v;
			effects.forEach((effect) => effect(v));
		},
		addEffect(effect: Effect<T>, run = false) {
			effects.push(effect);
			if (run) effect(state);
		},
	};
}
