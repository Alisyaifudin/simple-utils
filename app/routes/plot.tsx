import { MetaFunction } from "@remix-run/react";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { useContext } from "~/hooks/useContext";

export const meta: MetaFunction = () => {
	return [{ title: "Simple utils | Plot" }];
};

export default function Page() {
	const { pyodide } = useContext();
	const [plotData, setPlotData] = useState<string>("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function load() {
			// Install required packages
			await pyodide.loadPackage(["matplotlib", "numpy"]);

			// Initialize matplotlib for web output
			await pyodide.runPythonAsync(`
        import matplotlib.pyplot as plt
        import numpy as np
        plt.switch_backend('agg')
      `);
			setLoading(false);
		}

		load();
	}, [pyodide]);

	const generatePlot = async () => {
		if (!pyodide) return;

		const pythonCode = await fetch("/plot.py");
		setLoading(true);
		const result = await pyodide.runPythonAsync(await pythonCode.text());
		setPlotData(result);
		setLoading(false);
	};

	return (
		<main className="p-4 max-w-4xl mx-auto flex flex-col gap-2">
			<h1 className="text-2xl font-bold mb-4">Python Plot Generator</h1>

			<Button
				onClick={generatePlot}
				disabled={loading}
				className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fit"
			>
				Generate New Plot
			</Button>
			{loading ? <p>Loading... <Loader className="animate-spin" /></p> : null}

			{plotData && (
				<div className="border p-4 mt-4">
					<img src={`data:image/png;base64,${plotData}`} alt="Generated Plot" className="mx-auto" />
				</div>
			)}
		</main>
	);
}
