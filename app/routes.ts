import { index, layout, route, type RouteConfig } from "@remix-run/route-config";

export default [
	index("./routes/index.tsx"),
	layout("./layouts/Python.tsx", [
		route("/split-pdf", "./routes/split-pdf.tsx"),
		route("/plot", "./routes/plot.tsx"),
	]),
	layout("./layouts/FFmpeg.tsx", [
		// route("/video-converter", "./routes/video-converter.tsx"),
		route("/video-clipper", "./routes/video-clipper.tsx"),
	]),
] satisfies RouteConfig;
