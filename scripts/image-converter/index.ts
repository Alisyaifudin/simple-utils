import { getElement } from "../share/element.js";
import { state$ } from "../share/state$.js";
import { handleSelectFrom, handleSelectTo, switchExtension } from "./extension.js";
import { attachPreview, convertFile, handleUpload } from "./file.js";

export type ImgType = "png" | "webp" | "jpeg";

const fileInput = getElement<HTMLInputElement>("#file-input");
const preview = getElement<HTMLImageElement>("img");
const file$ = state$<File | null>(null);
fileInput.addEventListener("change", handleUpload(fileInput, file$));

const extensions$ = state$<{ from: ImgType; to: ImgType }>({ from: "png", to: "webp" });
file$.addEffect((file) => attachPreview(file, preview, extensions$));

const selectFrom = getElement("#from");
const selectTo = getElement("#to");
const optionsFrom = selectFrom.querySelectorAll("option");
const optionsTo = selectTo.querySelectorAll("option");
if (!(selectFrom instanceof HTMLSelectElement)) throw new Error("from is not a select");
if (!(selectTo instanceof HTMLSelectElement)) throw new Error("to is not a select");
selectFrom.addEventListener("change", handleSelectFrom(selectFrom, extensions$));
selectTo.addEventListener("change", handleSelectTo(selectTo, extensions$));

const switchBtn = getElement<HTMLButtonElement>("#switch");
switchBtn.addEventListener("click", () => switchExtension(extensions$));
extensions$.addEffect((extension) => {
	const ex = extension.from;
	fileInput.value = "";
	fileInput.accept = `image/${ex}`;
	file$.set = null;
	optionsFrom.forEach((option) => {
		option.selected = option.value === extension.from;
	});
	optionsTo.forEach((option) => {
		option.selected = option.value === extension.to;
	});
});

const convertBtn = getElement<HTMLButtonElement>("#convert-btn");
file$.addEffect((file) => {
	convertBtn.disabled = file === null;
});

convertBtn.addEventListener("click", async () => {
	const file = file$.get;
	if (file === null) return;
	const ex = extensions$.get.to;
	const names = file.name.split(".");
	const name =
		names.length > 1 ? `${names.slice(0, names.length - 1).join()}.${ex}` : `${file.name}.${ex}`;
	const url = await convertFile(file, ex);
	const a = document.createElement("a");
	a.href = url;
	a.download = name;
	a.click();
});
