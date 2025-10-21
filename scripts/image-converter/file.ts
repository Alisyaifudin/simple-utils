import { State$ } from "../share/state$.js";
import { ImgType } from "./index.js";

export function handleUpload(input: HTMLInputElement, file$: State$<File | null>) {
	return async function () {
		const files = input.files;

		if (files === null || files.length === 0) {
			file$.set = null;
			return;
		}
		file$.set = files[0];
	};
}
export async function attachPreview(
	file: File | null,
	img: HTMLImageElement,
	extensions$: State$<{ from: ImgType; to: ImgType }>
) {
	if (file === null) {
		img.src = "";
		img.hidden = true;
		return;
	}
	const url = await convertFile(file, extensions$.get.to);
	img.src = url;
	img.hidden = false;
}

export const convertFile = async (file: File, toEx: ImgType): Promise<string> => {
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

			try {
				const url = canvas.toDataURL(`image/${toEx}`, 0.85); // 0.85 quality
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
