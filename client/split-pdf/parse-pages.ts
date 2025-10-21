import { err, ok, type Result } from "../share/utils.js";

export function parsePages(value: string, total: number): Result<string, [number, number][]> {
	const pages: [number, number][] = [];
	const chunks = value.split(",");
	for (const chunk of chunks) {
		const num = Number(chunk);
		if (!isNaN(num)) {
			if (!Number.isInteger(num)) return err("Must be integer");
			if (num < 1) return err("Must be greater than 0");
			if (num > total) return err("Cannot greater than the total page");
			pages.push([num, num + 1]);
			continue;
		}
		const ranges = chunk.split("-");
		if (ranges.length !== 2) {
			return err("Invalid input");
		}
		const [n1, n2] = ranges.map(Number);
		if (isNaN(n1) || isNaN(n2)) {
			return err("Not a number");
		}
		if (n2 <= n1) {
			return err("Second number must be greater");
		}
		if (n1 > total) return err("Cannot greater than the total page");
		if (!Number.isInteger(n1) || !Number.isInteger(n2)) return err("Must be integer");
		const upper = n2 > total ? total + 1 : n2;
		pages.push([n1, upper]);
	}
	return ok(pages);
}
