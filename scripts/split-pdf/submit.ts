import { getElement } from "../share/element.js";
import { State$ } from "../share/state$.js";
import { parsePages } from "./parse-pages.js";
import { PDF } from "./pdf.js";

export function handleSubmit(form: HTMLFormElement, pdf: State$<PDF | null>) {
	const p = getElement<HTMLParagraphElement>("#pdf-status");
	return async function (e: SubmitEvent) {
		e.preventDefault();
		if (pdf.get === null) return;
		const formdata = new FormData(form);
		const pagesStr = formdata.get("pages");
		const total = await pdf.get.count();
		if (!isString(pagesStr)) return;
		const [errMsg, pages] = parsePages(pagesStr, total);
		if (errMsg !== null) {
			p.textContent = errMsg;
			return;
		}
		p.textContent = "";

		const ul = getElement<HTMLUListElement>("#results");
		ul.innerHTML = "";
		const filenames = pdf.get.file.name.split(".");
		const filename = filenames.slice(0, filenames.length - 1);
		for (const [from, to] of pages) {
			const [li, a] = createLi(ul);
			li.textContent = "Loading...";
			pdf.get.split([from, to]).then(([errMsg, blob]) => {
				if (errMsg !== null) {
					li.textContent = errMsg;
					return;
				}
				const url = URL.createObjectURL(blob);
				a.href = url;
				const name =
					to === from + 1 ? `${filename}-${from}.pdf` : `${filename}-${from}-${to - 1}.pdf`;
				a.download = a.textContent = name;
				li.innerHTML = "";
				li.appendChild(a);
			});
		}
	};
}

function isString(v: unknown): v is string {
	return typeof v === "string";
}

function createLi(ul: HTMLUListElement) {
	const li = document.createElement("li");
	const a = document.createElement("a");
	ul.appendChild(li);
	return [li, a] as const;
}
