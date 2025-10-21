import { PDFDocument } from "../share/pdfjs.js";
import { err, ok, Result } from "../share/utils.js";

export class PDF {
	private _document: PDFDocument | null = null;
	constructor(public file: File) {
		this.document();
	}
	async document() {
		if (this._document) return this._document;
		const arrayBuffer = await this.file.arrayBuffer();
		const doc = await PDFDocument.load(arrayBuffer);
		this._document = doc;
		return doc;
	}
	async count() {
		const doc = await this.document();
		return doc.getPageCount();
	}
	async split(pages: [number, number]): Promise<Result<string, Blob>> {
		const [from, to] = pages;
		const original = await this.document();
		const total = original.getPageCount();
		if (from < 1 || from > total || from >= to) {
			return err(`Invalid page range: ${from}-${to}. PDF has ${total} pages.`);
		}
		const newDoc = await PDFDocument.create();

		const pageIndices = Array.from({ length: to - from }).map((_, i) => from - 1 + i);
		const copiedPages = await newDoc.copyPages(original, pageIndices);
		copiedPages.forEach((page) => newDoc.addPage(page));
		const pdfBytes = await newDoc.save();
		const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
		return ok(blob);
	}
}
