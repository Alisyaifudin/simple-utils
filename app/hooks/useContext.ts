import { useOutletContext } from "@remix-run/react";
import { PyodideInterface } from "pyodide";

export function useContext(): { pyodide: PyodideInterface } {
	const contextRaw = useOutletContext();
	if (typeof contextRaw !== "object" || contextRaw === null || !("pyodide" in contextRaw)) {
		throw new Error("useOutletContext outside the world!");
	}
	const context = contextRaw as {
		pyodide: PyodideInterface;
	};
	return context;
}
