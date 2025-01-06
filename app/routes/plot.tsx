import { useEffect, useState } from "react";
import { loadPyodide, PyodideInterface } from "pyodide";

export default function Page() {
	const [loading, setLoading] = useState(true);
	const [pyodide, setPyodide] = useState<PyodideInterface|null>(null);
	const [plotData, setPlotData] = useState<string>("");

	useEffect(() => {
		async function load() {
			const pyodide = await loadPyodide({
				indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/",
			});

			// Install required packages
			await pyodide.loadPackage(["matplotlib", "numpy"]);

			// Initialize matplotlib for web output
			await pyodide.runPythonAsync(`
        import matplotlib.pyplot as plt
        import numpy as np
        plt.switch_backend('agg')
      `);

			setPyodide(pyodide);
			setLoading(false);
		}

		load();
	}, []);

	const generatePlot = async () => {
		if (!pyodide) return;

		const pythonCode = `
import io
import base64

# Generate random data
x = np.linspace(0, 10, 100)
y = np.sin(x) + np.random.normal(0, 0.1, 100)

# Create plot
plt.figure(figsize=(8, 6))
plt.plot(x, y, 'b-', label='Random Data')
plt.title('Random Plot')
plt.xlabel('X axis')
plt.ylabel('Y axis')
plt.grid(True)
plt.legend()

# Save plot to bytes buffer
buffer = io.BytesIO()
plt.savefig(buffer, format='png')
plt.close()

# Convert to base64 string
buffer.seek(0)
plot_data = base64.b64encode(buffer.read()).decode('utf-8')
plot_data
`;

		const result = await pyodide.runPythonAsync(pythonCode);
		setPlotData(result);
	};

	if (loading) {
		return <div className="p-4">Loading Python environment...</div>;
	}

	return (
		<div className="p-4 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-4">Python Plot Generator</h1>

			<button
				onClick={generatePlot}
				className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
			>
				Generate New Plot
			</button>

			{plotData && (
				<div className="border p-4 mt-4">
					<img src={`data:image/png;base64,${plotData}`} alt="Generated Plot" className="mx-auto" />
				</div>
			)}
		</div>
	);
}
