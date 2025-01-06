import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useContext } from "~/hooks/useContext";

export default function Page() {
	const { pyodide } = useContext();
	const [loading, setLoading] = useState(true);
	const [status, setStatus] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		async function load() {
			// Define the PDF splitting function
			const pythonCode = await fetch("/pdf-split.py");
			await pyodide.runPythonAsync(await pythonCode.text());
			setLoading(false);
		}

		load();
	}, [pyodide]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!pyodide) return;
		const formData = new FormData(e.currentTarget);

		const form = z.object({
			from: z.coerce.number().int().min(1),
			to: z
				.string()
				.refine((value) => {
					if (value === "") return true;
					return isFinite(Number(value)) && Number.isInteger(Number(value));
				}, "to tidak sah")
				.transform<number | null>((value) => {
					if (value === "") return null;
					return Number(value);
				}),
		}).safeParse({
			from: formData.get("from"),
			to: formData.get("to")
		})
		if (!fileInputRef.current?.files?.length) {
			setStatus("Please select a PDF file");
			return;
		}
		if(!form.success) {
			const error = form.error.flatten().formErrors.join("; ");
			setStatus(error);
			return;
		}
		const {from, to} = form.data
		if (!from) {
			setStatus("Please enter correct page");
			return;
		}
		if (to && to < from) {
			setStatus("To page must be greater than from");
			return;
		}

		setStatus("Processing...");

		try {
			const file = fileInputRef.current.files[0];
			const fileData = await file.arrayBuffer();
			const base64Data = btoa(
				new Uint8Array(fileData).reduce((data, byte) => data + String.fromCharCode(byte), "")
			);

			const result = await pyodide.runPythonAsync(
				to
					? `
        pdf_split('${base64Data}', ${from}, ${to})
      `
					: `
        pdf_split('${base64Data}', ${from})
      `
			);

			// Create download link
			const blob = new Blob([Uint8Array.from(atob(result), (c) => c.charCodeAt(0))], {
				type: "application/pdf",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			let name = `split_${from}`;
			if (to) name += `_${to}`;
			name += `_${file.name}`;
			a.href = url;
			a.download = name;
			a.click();
			URL.revokeObjectURL(url);

			setStatus("PDF split successfully!");
		} catch (error) {
			setStatus(`Error: ${(error as Error).message}`);
		}
	};

	if (loading)
		return (
			<main className="flex h-screen flex-col justify-center gap-2 items-center">
				<Loader2 className="w-6 h-6 animate-spin" />
				<p>Loading PyPDF2</p>
			</main>
		);

	return (
		<div className="p-4 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-4">PDF Splitter</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<Label className="block">
						Select PDF File:
						<Input
							type="file"
							ref={fileInputRef}
							accept=".pdf"
							className="block w-full mt-1 border rounded-md p-2"
						/>
					</Label>
				</div>

				<div className="flex gap-2">
					<div className="flex items-center gap-2">
						<Label className="block">From:</Label>
						<Input
							type="number"
							name="from"
							className="block w-full max-w-[60px] border rounded-md p-2"
						/>
					</div>
					<div className="flex items-center gap-2">
						<Label className="block">To:</Label>
						<Input
							type="number"
							name="to"
							className="block w-full max-w-[60px] border rounded-md p-2"
						/>
					</div>
				</div>
				<p><em className="font-bold">To</em> page can be empty. Meaning split only one page.</p>
				<Button
					type="submit"
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
				>
					Split PDF
				</Button>
			</form>

			{status && <div className="mt-4 p-4 border rounded-md">{status}</div>}
		</div>
	);
}
