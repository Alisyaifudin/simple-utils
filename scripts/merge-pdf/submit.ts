import { getElement } from "../share/element.js";
import { PDFDocument } from "../share/pdfjs.js";
import { State$ } from "../share/state$.js";
import { err, ok, Result } from "../share/utils.js";

export function handleSubmit(files$: State$<File[]>) {
	const p = getElement<HTMLParagraphElement>("#pdf-status");
	return async function (e: SubmitEvent) {
		e.preventDefault();
		if (files$.get.length === 0) return;
		p.textContent = "Loading...";
		const [errMsg, blob] = await mergePdf(files$.get);
		if (errMsg !== null) {
			p.textContent = errMsg;
			return;
		}
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `merge-${Date.now()}.pdf`;
		a.click();
		URL.revokeObjectURL(url);
		p.textContent = "Successful";
	};
}

async function loadPdf(file: File) {
	const buffer = await file.arrayBuffer();
	const pdf = await PDFDocument.load(buffer);
	return pdf;
}

async function mergePdf(files: File[]): Promise<Result<string, Blob>> {
	const loadPromises = files.map((file) => loadPdf(file));
	const promiseRes = await Promise.allSettled(loadPromises);
	let failedFlag = false;
	const errMsgs: [string, any][] = [];
	const pdfs: PDFDocument[] = [];
	promiseRes.forEach((r, i) => {
		if (r.status === "rejected") {
			failedFlag = true;
			errMsgs.push([`Something went wrong at ${files[i].name}`, r.reason]);
			return;
		}
		pdfs.push(r.value);
	});
	if (failedFlag) {
		return err(JSON.stringify(errMsgs));
	}
	const newDoc = await PDFDocument.create();
	for (const pdf of pdfs) {
		const copies = await newDoc.copyPages(pdf, pdf.getPageIndices());
		copies.forEach((page) => newDoc.addPage(page));
	}
	const pdfBytes = await newDoc.save();
	const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
	return ok(blob);
}
