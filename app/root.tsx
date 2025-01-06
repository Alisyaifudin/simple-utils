import type { LinksFunction } from "@remix-run/cloudflare";
import { Link, Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import "./tailwind.css";
import { useEffect, useState } from "react";
import { loadPyodide, PyodideInterface } from "pyodide";

export const links: LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<header className="p-2 bg-card">
					<Link className="text-2xl underline" to="/">
						Simple utils
					</Link>
				</header>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	const [loading, setLoading] = useState(true);
	const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
	useEffect(() => {
		async function load() {
			const pyodide = await loadPyodide({
				indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/",
			});

			// Install PyPDF2
			await pyodide.loadPackage("micropip");
			await pyodide.runPythonAsync(`
        import micropip
        await micropip.install('PyPDF2')
      `);
			setPyodide(pyodide);
			setLoading(false);
		}
		load();
	}, []);
	if (loading)
		return (
			<main className="flex h-screen flex-col justify-center gap-2 items-center">
				<Loader2 className="w-6 h-6 animate-spin" />
				<p>Loading Python environment...</p>
			</main>
		);
	return <Outlet context={{ pyodide }} />;
}
