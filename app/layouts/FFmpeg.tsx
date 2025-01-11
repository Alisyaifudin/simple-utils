import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { Outlet } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Ffmpeg() {
	const ffmpegRef = useRef(new FFmpeg());
	const [loaded, setLoaded] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
		const load = async () => {
			const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";
			const ffmpeg = ffmpegRef.current;
			try {
				await ffmpeg.load({
					coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
					wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
					// workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
				});
				setLoaded(true);
			} catch (error) {
				console.error(error);
				console.error("Some error");
				setError(true);
			}
		};
		load().then(() => console.log("ffmpeg loaded"));
	}, []);

	if (error) {
		return (
			<main className="flex h-screen flex-col justify-center gap-2 items-center">
				<p>Something went wrong</p>
			</main>
		);
	}
	if (!loaded) {
		return (
			<main className="flex h-screen flex-col justify-center gap-2 items-center">
				<Loader2 className="w-6 h-6 animate-spin" />
				<p>Loading FFMPEG...</p>
			</main>
		);
	}
	return <Outlet context={{ ffmpeg: ffmpegRef.current }} />;
}

// export default function Ffmpeg() {
// 	const ffmpegRef = useRef(new FFmpeg());
// 	const [loaded, setLoaded] = useState(false);

// 	useEffect(() => {
// 		const load = async () => {
// 			const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";
// 			const ffmpeg = ffmpegRef.current;
// 			await ffmpeg.load({
// 				coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
// 				wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
// 			});
// 			setLoaded(true);
// 		};
// 		load().then(() => console.log("ffmpeg loaded"));
// 	}, []);
// 	return <Outlet context={{ ffmpeg: ffmpegRef.current, loaded }} />;
// }
