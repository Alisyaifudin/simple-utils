import { useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export default function Page() {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const { loaded, ffmpegRef, messageRef } = useFfmpeg();
	const [file, setFile] = useState<null | File>(null);

	const transcode = async () => {
		if (!file) return;
		const ffmpeg = ffmpegRef.current;
		const name = file.name;
		const inputFileData = await file.arrayBuffer();
		await ffmpeg.writeFile(name, new Uint8Array(inputFileData));
		await ffmpeg.exec(["-i", name, "output.mp4"]);
		const fileData = await ffmpeg.readFile("output.mp4");
		const data = new Uint8Array(fileData as ArrayBuffer);
		if (videoRef.current) {
			videoRef.current.src = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));
		}
	};

	const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
		const files = e.currentTarget.files;
		if (!files || files.length === 0) {
			setFile(null);
			return;
		}
		setFile(files[0]);
	};

	return loaded ? (
		<main className="flex flex-col gap-2 items-center w-full max-w-4xl mx-auto">
			<div>
				<Input onInput={handleInput} type="file" accept=".webm" />
			</div>
			<Button className="w-fit" disabled={file === null} onClick={transcode}>
				Convert
			</Button>
			{videoRef.current ? (
				<video ref={videoRef} controls>
					<track kind="caption" />
				</video>
			) : null}
			<p ref={messageRef}></p>
		</main>
	) : (
		<p>Loading ffmpeg</p>
	);
}

function useFfmpeg() {
	const ffmpegRef = useRef(new FFmpeg());
	const [loaded, setLoaded] = useState(false);
	const messageRef = useRef<HTMLParagraphElement | null>(null);

	useEffect(() => {
		const load = async () => {
			const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";
			const ffmpeg = ffmpegRef.current;
			ffmpeg.on("log", ({ message }) => {
				if (messageRef.current) messageRef.current.innerHTML = message;
			});
			// toBlobURL is used to bypass CORS issue, urls with the same
			// domain can be used directly.
			await ffmpeg.load({
				coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
				wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
				// workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
			});
			setLoaded(true);
		};
		load().then(() => console.log("ffmpeg loaded"));
	}, []);
	return { loaded, messageRef, ffmpegRef };
}
