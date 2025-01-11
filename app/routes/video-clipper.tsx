import { useRef, useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Loader2 } from "lucide-react";
import { MetaFunction } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { z } from "zod";
import { useFFmpegContext } from "~/hooks/useFfmpegContext";

export const meta: MetaFunction = () => {
	return [{ title: "Simple utils | Clip Video" }];
};

export default function Page() {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const { loaded, ffmpeg } = useFFmpegContext();
	const [errorMsg, setErrorMsg] = useState("");
	const [file, setFile] = useState<null | File>(null);
	const messageRef = useRef<HTMLParagraphElement | null>(null);

	const transcode = async (start: string, end: string) => {
		if (!file) return;
		const name = file.name;
		const extension = name.split(".").at(-1);
		if (!extension) return;
		const inputFileData = await file.arrayBuffer();
		const inputName = "input." + extension;
		const outputName = "output." + extension;
		await ffmpeg.writeFile(inputName, new Uint8Array(inputFileData));
		await ffmpeg.exec(["-i", inputName, "-ss", start, "-to", end, "output." + outputName]);
		const fileData = await ffmpeg.readFile("output." + extension);
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
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		ffmpeg.on("log", ({ message }) => {
			if (messageRef.current) messageRef.current.innerText = message;
			console.log(message);
		});
		const formData = new FormData(e.currentTarget);
		const input = z
			.object({
				start: z.string().regex(/^\d+:\d{2}:\d{2}$/),
				end: z.string().regex(/^\d+:\d{2}:\d{2}$/),
			})
			.safeParse({
				start: formData.get("start-time"),
				end: formData.get("end-time"),
			});
		if (!input.success) {
			setErrorMsg(input.error.flatten().formErrors.join("; "));
			return;
		}
		const { end, start } = input.data;
		const [startH, startM, startS] = start.split(":").map(Number);
		const [endH, endM, endS] = end.split(":").map(Number);
		if (endH * 3600 + endM * 60 + endS < startH * 3600 + startM * 60 + startS) {
			setErrorMsg("end time must be after start time");
			return;
		}
		setErrorMsg("");
		await transcode(start, end);
	};
	const currentSrc = !file ? "" : URL.createObjectURL(file);
	return loaded ? (
		<main className="flex flex-col gap-2 items-center w-full max-w-4xl mx-auto">
			<h1 className="self-start text-2xl font-bold">Clip Video</h1>
			<form onSubmit={handleSubmit} className={cn("flex flex-col gap-2 items-center")}>
				<Input onInput={handleInput} type="file" accept=".mp4" required />
				<div className="flex items-center gap-1 sm:gap-5 sm:flex-row flex-col">
					<div className="flex flex-col gap-2">
						<p>Original</p>
						<video
							controls
							className={cn("w-full max-w-[400px]", { hidden: currentSrc == "" })}
							src={currentSrc}
						></video>
					</div>
					<div
						className={cn("flex flex-col gap-2", {
							hidden: !videoRef.current || videoRef.current.src == "",
						})}
					>
						<p>Clipped</p>
						<video ref={videoRef} controls className="w-full max-w-[400px]"></video>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<div className="flex flex-col gap-1">
						<Label htmlFor="start-time">Start time</Label>
						<Input
							name="start-time"
							id="start-time"
							required
							type="text"
							pattern="^\d+:\d{2}:\d{2}$"
							placeholder="ex. 00:00:10"
						/>
					</div>
					<div className="flex flex-col gap-1">
						<Label htmlFor="end-time">End time</Label>
						<Input
							name="end-time"
							id="end-time"
							type="text"
							required
							pattern="^\d+:\d{2}:\d{2}$"
							placeholder="ex. 00:01:00"
						/>
					</div>
				</div>
				<Button className="w-fit" disabled={file === null}>
					Clip
				</Button>
			</form>
			{errorMsg ? <p className="text-red-500">{errorMsg}</p> : null}
			<p ref={messageRef} className="text-sm"></p>
			<div className="flex flex-col gap-1 py-5 outline outline-1 outline-muted px-3">
				<p>
					Run locally using{" "}
					<a href="https://www.ffmpeg.org/" className="underline">
						ffmpeg
					</a>
				</p>
				<code className="p-2 bg-background">
					ffmpeg -i {"<input_file>"} -ss {"start_time"} -to {"end_time"} {"<input_name>"}
				</code>
				<p>ex.</p>
				<code className="p-2 bg-background">
					ffmpeg -i input.mp4 -ss 00:01:00 -to 00:02:23 output.mp4
				</code>
			</div>
		</main>
	) : (
		<main className="flex h-screen flex-col justify-center gap-2 items-center">
			<Loader2 className="w-6 h-6 animate-spin" />
			<p>Loading FFMPEG...</p>
		</main>
	);
}
