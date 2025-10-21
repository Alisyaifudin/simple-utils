import { ImgType } from ".";
import { State$ } from "../share/state$";

export function switchExtension(extensions$: State$<{ from: ImgType; to: ImgType }>) {
	extensions$.setter((old) => {
		[old.from, old.to] = [old.to, old.from];
		return old;
	});
}

export function handleSelectFrom(
	select: HTMLSelectElement,
	extensions$: State$<{ from: ImgType; to: ImgType }>
) {
	return function () {
		const value = select.value;
		if (!check(value)) return;
		let to = extensions$.get.to;
		if (extensions$.get.to === value) {
			to = extensions$.get.from;
		}
		extensions$.set = { from: value, to };
	};
}

export function handleSelectTo(
	select: HTMLSelectElement,
	extensions$: State$<{ from: ImgType; to: ImgType }>
) {
	return function () {
		const value = select.value;
		if (!check(value)) return;
		let from = extensions$.get.from;
		if (extensions$.get.from === value) {
			from = extensions$.get.to;
		}
		extensions$.set = { from, to: value };
	};
}

function check(v: string): v is ImgType {
	return v === "png" || v === "webp" || v === "jpeg";
}
