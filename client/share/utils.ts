type Ok<T> = [null, T];
type Err<E> = [E, null];
export type Result<E, T> = Err<E> | Ok<T>;

export function err<E>(value: E): Err<E> {
	return [value, null];
}

export function ok<T>(value: T): Ok<T> {
	return [null, value];
}
