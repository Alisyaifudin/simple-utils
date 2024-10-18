import { Form, Link, type MetaFunction } from "react-router";
import type * as Route from "./+types.split-pdf";
import { z } from "zod";
import { numeric } from "~/lib/zod-custom";
import { PDFDocument } from "pdf-lib";
import { useEffect } from "react";

export const meta: MetaFunction = () => {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
};

export async function clientAction({
	request,
}: Route.ClientActionArgs): Promise<
	{ success: true; blob: Blob; name: string } | { success: false; error: Error }
> {
	const formData = await request.formData();
	const data = z
		.object({
			file: z.instanceof(File),
			start: numeric,
			end: numeric,
		})
		.safeParse({
			file: formData.get("file"),
			start: formData.get("page-start"),
			end: formData.get("page-end"),
		});
	if (!data.success) {
		return {
			success: false,
			error: data.error,
		};
	}
	// Load the existing PDF document
	const { file, start, end } = data.data;
	const oriName = file.name;
	const existingPdfBytes = await file.arrayBuffer();
	const pdfDoc = await PDFDocument.load(existingPdfBytes);

	// Validate page range
	const totalPages = pdfDoc.getPageCount();
	if (start < 1 || end > totalPages || start > end) {
		return {
			success: false,
			error: new Error(`Invalid page range. The PDF has ${totalPages} pages.`),
		};
	}

	// Create a new PDF document for the output
	const newPdfDoc = await PDFDocument.create();

	// Copy pages from the original PDF to the new one
	const pages = await newPdfDoc.copyPages(
		pdfDoc,
		Array.from({ length: end - start + 1 }, (_, i) => i + start - 1)
	);

	pages.forEach((page) => newPdfDoc.addPage(page));

	// Serialize the new PDF document to bytes
	const pdfBytes = await newPdfDoc.save();

	// Create a Blob for the PDF and generate a download link
	const blob = new Blob([pdfBytes], { type: "application/pdf" });

	return { blob, success: true, name: `${oriName}-${start}-${end}.pdf` };
}

export default function Component({ actionData }: Route.ComponentProps) {
	let data = undefined as undefined | { url: string; name: string };
	let error = undefined as undefined | Error;
	if (actionData) {
		if (actionData.success) {
			data = {
				url: URL.createObjectURL(actionData.blob),
				name: actionData.name,
			};
		} else error = actionData.error;
	}
	useEffect(() => {
		if (!data) return;
		// Create an anchor element, set its href to the blob URL, and trigger download
		const anchor = document.createElement("a");
		anchor.href = data.url;
		anchor.download = data.name; // Specify the download file name
		document.body.appendChild(anchor); // Append anchor to the document body
		anchor.click(); // Programmatically trigger the download
		document.body.removeChild(anchor); // Clean up after download
		// Refresh the page after download
		setTimeout(() => URL.revokeObjectURL(data.url), 400);
		setTimeout(() => window.location.reload(), 500); // Add a slight delay before refreshing
	}, [data]);
	return (
		<main className="flex flex-col gap-2 p-2">
			<Link to="/">Back</Link>
			<Form method="post" className="grid grid-cols-[1fr_3fr] gap-2" encType="multipart/form-data">
				<label htmlFor="file">File</label>
				<input type="file" id="file" accept="application/pdf" name="file" />
				<p className="col-span-2">Page number</p>
				<label htmlFor="file">From</label>
				<input type="number" name="page-start" />
				<label htmlFor="file">To</label>
				<input type="number" name="page-end" />
				<button className="bg-zinc-800" type="submit">
					Split
				</button>
			</Form>
			{error && <p>{error.message}</p>}
		</main>
	);
}
