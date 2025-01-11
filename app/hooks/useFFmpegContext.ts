import { FFmpeg } from "@ffmpeg/ffmpeg";
import { useOutletContext } from "@remix-run/react";

export function useFFmpegContext(): { ffmpeg: FFmpeg; loaded: boolean } {
	const contextRaw = useOutletContext();
	if (typeof contextRaw !== "object" || contextRaw === null || !("ffmpeg" in contextRaw)) {
		throw new Error("useOutletContext outside the world!");
	}
	const context = contextRaw as {
		ffmpeg: FFmpeg;
		loaded: boolean;
	};
	return context;
}
