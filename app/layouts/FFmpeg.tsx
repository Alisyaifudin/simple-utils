import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { Outlet } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";

export default function Ffmpeg() {
	const ffmpegRef = useRef(new FFmpeg());
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		const load = async () => {
			const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";
			const ffmpeg = ffmpegRef.current;
			await ffmpeg.load({
				coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
				wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
			});
			setLoaded(true);
		};
		load().then(() => console.log("ffmpeg loaded"));
	}, []);
	return <Outlet context={{ ffmpeg: ffmpegRef.current, loaded }} />;
}
