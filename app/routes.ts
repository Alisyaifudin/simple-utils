import { index, layout, route, type RouteConfig } from "@remix-run/route-config";

export default [
	index("./routes/index.tsx"),
	layout("./layouts/Python.tsx", [
		route("/split-pdf", "./routes/split-pdf.tsx"),
		route("/plot", "./routes/plot.tsx"),
	]),
	layout("./layouts/FFmpeg.tsx", [route("/video-clipper", "./routes/video-clipper.tsx")]),
	route("/image-converter", "./routes/image-converter.tsx"),
] satisfies RouteConfig;
