import { index, route, type RouteConfig } from "@remix-run/route-config";

export default [
	index("./routes/index.tsx"),
	route("/split-pdf", "./routes/split-pdf.tsx"),
	route("/plot", "./routes/plot.tsx"),
] satisfies RouteConfig;
