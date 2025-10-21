import { getElement } from "../share/element.js";
import { state$ } from "../share/state$.js";
import { attachFiles, handlePDFUpload } from "./read-pages.js";
import { handleSubmit } from "./submit.js";

const pdfInput = getElement<HTMLInputElement>("#pdf-input");
const files$ = state$<File[]>([]);
const form = getElement<HTMLFormElement>("form");
const ul = getElement<HTMLUListElement>("#file-list");

pdfInput.addEventListener("change", handlePDFUpload(pdfInput, files$));
attachFiles(files$, ul);
form.addEventListener("submit", handleSubmit(files$));
