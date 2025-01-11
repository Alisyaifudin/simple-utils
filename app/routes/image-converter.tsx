import React, { SVGProps, useState } from "react";
import { defaultFormats, defaultPlugins } from "jimp";
import webp from "@jimp/wasm-webp";
import { createJimp } from "@jimp/core";
import { Input } from "~/components/ui/input";
import { download } from "~/lib/download-imperative";
import { Label } from "~/components/ui/label";
import { useSearchParams } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";

const Jimp = createJimp({
	formats: [...defaultFormats, webp],
	plugins: defaultPlugins,
});

const EXTENSIONS = ["image/jpeg", "image/png", "image/webp"] as const;

export default function ImageConverter() {
	const [isConverting, setIsConverting] = useState(false);
	const [searchParams, setSearchParams] = useSearchParams();
	const fromExRaw = z.enum(EXTENSIONS).safeParse(searchParams.get("from"));
	const fromEx = fromExRaw.success ? fromExRaw.data : EXTENSIONS[0];
	const toEXTENSIONS = EXTENSIONS.filter((e) => e !== fromEx);
	const toExRaw = z.enum(EXTENSIONS).safeParse(searchParams.get("to"));
	let toEx = !toExRaw.success || toExRaw.data === fromEx ? toEXTENSIONS[0] : toExRaw.data;
	const fromEXTENSIONS = EXTENSIONS.filter((e) => e !== toEx);
	const handleSwap = () => {
		setSearchParams((searchParams) => {
			searchParams.set("from", toEx);
			searchParams.set("to", fromEx);
			return searchParams;
		});
	};
	async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		const names = file.name.split(".");
		if (names.length !== 2) {
			console.error("Not 2?", names);
			return;
		}
		const [name, extension] = names;
		setIsConverting(true);
		const reader = new FileReader();
		reader.onload = async (e) => {
			const data = e.target?.result;
			if (!data || !(data instanceof ArrayBuffer)) return;

			try {
				// Load the image from buffer
				const image = await Jimp.fromBuffer(data);

				// Convert to JPEG format with quality 85
				const processed =
					toEx === "image/jpeg"
						? await image.getBuffer(toEx, { quality: 85 })
						: await image.getBuffer(toEx);

				// Create blob URL for display
				const blob = new Blob([processed], { type: "image/jpeg" });
				const outputUrl = URL.createObjectURL(blob);
				download(outputUrl, name + "." + toEx.split("/")[1]);
			} catch (error) {
				console.error("Error converting image:", error);
			} finally {
				setIsConverting(false);
			}
		};

		reader.onerror = (error) => {
			console.error("Error reading file:", error);
			setIsConverting(false);
		};

		reader.readAsArrayBuffer(file);
	}

	return (
		<main className="flex flex-col gap-4 items-center w-full max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 self-start">Image Converter</h1>
			<div className="flex justify-between w-full max-w-md">
				<div className="flex flex-col gap-1">
					<Label>From</Label>
					<select
						className="w-[80px]"
						value={fromEx}
						onChange={(e) =>
							setSearchParams((prev) => {
								prev.set("from", e.currentTarget.value);
								return prev;
							})
						}
					>
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
					<select
						className="w-[80px]"
						value={toEx}
						onChange={(e) =>
							setSearchParams((prev) => {
								prev.set("to", e.currentTarget.value);
								return prev;
							})
						}
					>
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
				onChange={handleFile}
				disabled={isConverting}
				className="max-w-md"
			/>
			{isConverting && <p className="text-center text-sm text-gray-500">Converting...</p>}
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
