import React, { SVGProps, useRef, useState } from "react";
import { Input } from "~/components/ui/input";
import { download } from "~/lib/download-imperative";
import { Label } from "~/components/ui/label";
import { MetaFunction, useSearchParams } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";

export const meta: MetaFunction = () => {
	return [{ title: "Simple utils | Image Converter" }];
};

const EXTENSIONS = ["image/jpeg", "image/png", "image/webp"] as const;

export default function ImageConverter() {
	const [isConverting, setIsConverting] = useState(false);
	const [searchParams, setSearchParams] = useSearchParams();
	const inputRef = useRef<HTMLInputElement>(null);
	const [file, setFile] = useState<File | null>(null);
	const fromExRaw = z.enum(EXTENSIONS).safeParse(searchParams.get("from"));
	const fromEx = fromExRaw.success ? fromExRaw.data : EXTENSIONS[0];
	const toEXTENSIONS = EXTENSIONS.filter((e) => e !== fromEx);
	const toExRaw = z.enum(EXTENSIONS).safeParse(searchParams.get("to"));
	let toEx = !toExRaw.success || toExRaw.data === fromEx ? toEXTENSIONS[0] : toExRaw.data;
	const fromEXTENSIONS = EXTENSIONS.filter((e) => e !== toEx);
	const handleChangeEx = (t: "from" | "to") => (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSearchParams((prev) => {
			prev.set(t, e.currentTarget.value);
			return prev;
		});
		if (inputRef.current) inputRef.current.value = "";
		setFile(null);
	};
	const handleSwap = () => {
		setSearchParams((searchParams) => {
			searchParams.set("from", toEx);
			searchParams.set("to", fromEx);
			return searchParams;
		});
		if (inputRef.current) inputRef.current.value = "";
		setFile(null);
	};

	const convert = async (file: File): Promise<string> => {
		// Create an image element
		const img = new Image();
		// Create canvas
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			throw new Error("Could not get canvas context");
		}

		// Create a promise to handle image loading
		return new Promise((resolve, reject) => {
			img.onload = () => {
				// Set canvas dimensions to match image
				canvas.width = img.width;
				canvas.height = img.height;

				// Draw image onto canvas
				ctx.drawImage(img, 0, 0);

				// Convert to JPEG
				try {
					const url = canvas.toDataURL(toEx, 0.85); // 0.85 quality
					resolve(url);
				} catch (error) {
					reject(error);
				}
			};

			img.onerror = () => {
				reject(new Error("Failed to load image"));
			};

			// Load the image
			img.src = URL.createObjectURL(file);
		});
	};

	async function handleConvert() {
		if (!file) return;
		const names = file.name.split(".");
		if (names.length !== 2) {
			throw new Error("not 2?: [" + names.join(",") + "]");
		}
		const [name, extension] = names;
		setIsConverting(true);

		try {
			const url = await convert(file);
			download(url, name);
		} catch (error) {
			console.error("Error converting image:", error);
		} finally {
			setIsConverting(false);
		}
	}
	const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) setFile(file);
		else setFile(null);
	};
	const url = file ? URL.createObjectURL(file) : "";
	return (
		<main className="flex flex-col gap-4 items-center w-full max-w-xl mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4 self-start">Image Converter</h1>
			<div className="flex justify-between w-full max-w-md">
				<div className="flex flex-col gap-1">
					<Label>From</Label>
					<select className="w-[80px]" value={fromEx} onChange={handleChangeEx("from")}>
						{fromEXTENSIONS.map((e) => (
							<option key={e} value={e}>
								{e.split("/")[1].toUpperCase()}
							</option>
						))}
					</select>
				</div>
				<Button variant="ghost" size="icon" onClick={handleSwap}>
					<IcSharpSwapHoriz />
				</Button>
				<div className="flex flex-col gap-1">
					<Label>To</Label>
					<select className="w-[80px]" value={toEx} onChange={handleChangeEx("to")}>
						{toEXTENSIONS.map((e) => (
							<option key={e} value={e}>
								{e.split("/")[1].toUpperCase()}
							</option>
						))}
					</select>
				</div>
			</div>
			<Input
				type="file"
				accept={fromEx}
				ref={inputRef}
				onChange={handleFile}
				disabled={isConverting}
				className="max-w-md"
			/>
			<Button onClick={handleConvert} disabled={file === null} className="flex items-center gap-2">
				Convert
				{isConverting && <Loader2 className="animate-spin" />}
			</Button>

			{url ? (
				<img className="w-full object-contain max-h-96 rounded-lg border" src={url} alt="Input" />
			) : null}
		</main>
	);
}

export function IcSharpSwapHoriz(props: SVGProps<SVGSVGElement>) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
			<path
				fill="currentColor"
				d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99zM21 9l-3.99-4v3H10v2h7.01v3z"
			></path>
		</svg>
	);
}
