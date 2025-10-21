import { elem$ } from "../share/elem$.js";
import { getElement } from "../share/element.js";
import { state$ } from "../share/state$.js";
import { PDF } from "./pdf.js";
import { attachPageNumber, handlePDFUpload } from "./read-pages.js";
import { handleSubmit } from "./submit.js";

const pdfInput = getElement<HTMLInputElement>("#pdf-input");
const file = state$<PDF | null>(null);
const pageNumber = elem$(getElement<HTMLParagraphElement>("#pdf-page"));
const form = getElement<HTMLFormElement>("form");

pdfInput.addEventListener("change", handlePDFUpload(pdfInput, file));
attachPageNumber(pageNumber, file);
form.addEventListener("submit", handleSubmit(form, file));
