import { Elem$ } from "../share/elem$.js";
import { State$ } from "../share/state$.js";
import { PDF } from "./pdf.js";

export function handlePDFUpload(pdfInput: HTMLInputElement, pdf: State$<PDF | null>) {
	return async function () {
		const files = pdfInput.files;

		if (files === null || files.length === 0) {
			pdf.set = null;
			return;
		}

		const file = files[0];

		const p = new PDF(file);
		pdf.set = p;
	};
}

export function attachPageNumber(pageNumber: Elem$<HTMLParagraphElement>, pdf: State$<PDF | null>) {
	pdf.addEffect(async (pdf) => {
		if (pdf === null) return;
		const file = pdf.file;
		// Validate file type
		if (file.type !== "application/pdf") {
			pageNumber.set((old) => {
				old.textContent = "Please select a valid PDF file.";
				old.className = "text-red-500";
				return old;
			});
			return;
		}
		try {
			pageNumber.set((old) => {
				old.textContent = "Reading PDF...";
				old.className = "";
				return old;
			});

			const numPages = await pdf.count();

			pageNumber.set((old) => {
				old.textContent = `PDF has ${numPages} page${numPages !== 1 ? "s" : ""}`;
				old.className = "";
				return old;
			});
		} catch (error) {
			console.error("PDF processing error:", error);
			pageNumber.set((old) => {
				old.textContent = "Error reading PDF. File may be corrupted or encrypted.";
				old.className = "text-red-500";
				return old;
			});
		}
	});
}
