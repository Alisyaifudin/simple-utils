import { Outlet } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import { PyodideInterface } from "pyodide";
import { useEffect, useState } from "react";

export default function Python() {
	const [loading, setLoading] = useState(true);
	const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
	useEffect(() => {
		async function load() {
			const pyodide = await window.loadPyodide({
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
