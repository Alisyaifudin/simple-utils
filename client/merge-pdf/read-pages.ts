import { Elem$ } from "../share/elem$.js";
import { State$ } from "../share/state$.js";

export function handlePDFUpload(pdfInput: HTMLInputElement, files$: State$<File[]>) {
	return async function () {
		const files = pdfInput.files;

		if (files === null || files.length === 0) {
			return;
		}
		files$.setter((old) => {
			old.push(...files);
			return old;
		});
		pdfInput.files = null;
		pdfInput.value = "";
	};
}
export function attachFiles(files$: State$<File[]>, ul: HTMLUListElement) {
	files$.addEffect((files) => {
		ul.innerHTML = "";
		files.forEach((file, i) => {
			const li = document.createElement("li");
			li.classList.add("flex", "items-center", "gap-1");
			if (i % 2 === 1) {
				li.classList.add("bg-card/50");
			}
			const div = document.createElement("div");
			div.classList.add("flex", "flex-1", "items-center", "gap-1");
			if (i > 0) {
				const up = createUp(files$, i);
				div.appendChild(up);
			}
			if (i < files.length - 1) {
				const down = createDown(files$, i);
				div.appendChild(down);
			}
			const p = document.createElement("p");
			const name = String(i + 1) + ". " + file.name;
			p.textContent = name;
			div.appendChild(p);
			li.appendChild(div);
			const deleteBtn = createDelete(files$, i);
			li.appendChild(deleteBtn);
			ul.appendChild(li);
		});
	});
}

function createUp(files$: State$<File[]>, i: number) {
	const btn = document.createElement("button");
	btn.classList.add("p-0", "bg-card", "border-border", "border", "rounded-full", "h-7", "w-7");
	btn.type = "button";
	btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up-icon lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>`;
	btn.addEventListener("click", () => {
		if (i === 0) return;
		files$.setter((old) => {
			[old[i - 1], old[i]] = [old[i], old[i - 1]];
			return old;
		});
	});
	return btn;
}

function createDown(files$: State$<File[]>, i: number) {
	const btn = document.createElement("button");
	btn.classList.add("p-0", "bg-card", "border-border", "border", "rounded-full", "h-7", "w-7");
	btn.type = "button";
	btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>`;
	btn.addEventListener("click", () => {
		if (i === files$.get.length - 1) return;
		files$.setter((old) => {
			[old[i + 1], old[i]] = [old[i], old[i + 1]];
			return old;
		});
	});
	return btn;
}
function createDelete(files$: State$<File[]>, i: number) {
	const deleteBtn = document.createElement("button");
	deleteBtn.classList.add(
		"p-0",
		"bg-destructive",
		"border-border",
		"border",
		"rounded-full",
		"h-7",
		"w-7"
	);
	deleteBtn.type = "button";
	deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
	deleteBtn.addEventListener("click", () => {
		files$.setter((old) => {
			old.splice(i, 1);
			return old;
		});
	});
	return deleteBtn;
}
