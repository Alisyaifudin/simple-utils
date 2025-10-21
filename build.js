import { build, context } from "esbuild";
import { join, relative } from "path";
import { stat } from "fs/promises";
import { glob } from "glob";
import { filesize } from "filesize";

async function getFileSize(filePath) {
	try {
		const stats = await stat(filePath);
		return {
			size: stats.size,
			formatted: filesize(stats.size),
		};
	} catch (error) {
		console.error(`Error getting size for ${filePath}:`, error);
		return { size: 0, formatted: "0 B" };
	}
}

async function showSize(cwd) {
	// Get sizes of all built files
	const jsFiles = await glob("*.js", { cwd });
	const buildResults = [];

	for (const file of jsFiles) {
		const outputPath = join(cwd, file);
		const sizeInfo = await getFileSize(outputPath);
		buildResults.push({
			file: relative(cwd, outputPath),
			size: sizeInfo.size,
			formattedSize: sizeInfo.formatted,
		});
	}

	// Display build results
	console.log("\nBuild completed! File sizes:");
	console.table(
		buildResults.map((r) => ({
			File: r.file,
			Size: r.formattedSize,
		}))
	);

	const totalSize = buildResults.reduce((sum, r) => sum + r.size, 0);
	console.log(`\nTotal size: ${filesize(totalSize)} (${buildResults.length} files)`);
}

// Build options
const getOptions = (bundle, prod) => ({
	platform: "browser",
	target: "es2015",
	format: "esm",
	bundle,
	minify: prod,
	sourcemap: !prod,
});

export async function buildScripts(prod, watch = false) {
	const srcDir = join(process.cwd(), "client");
	const outDir = join(process.cwd(), "public/scripts");
	const contexts = [];

	try {
		const all = await glob("*", { cwd: srcDir, withFileTypes: true });
		const dirs = all.filter((entry) => entry.isDirectory()).map((dir) => dir.name);
		for (const dir of dirs) {
			if (dir === "share") {
				if (!watch) {
					console.log("Building shared dependencies...");
				}

				const srcdir = join(srcDir, dir);
				const outdir = join(outDir, dir);
				const files = await glob("*.{ts,tsx}", { cwd: srcdir });

				const options = {
					...getOptions(true, prod),
					entryPoints: files.map((f) => join(srcdir, f)),
					outdir,
					external: files.map((file) => `./${file.replace(".ts", ".js")}`),
				};

				if (watch) {
					const ctx = await context(options);
					await ctx.watch();
					contexts.push(ctx);
				} else {
					await build(options);
					if (!watch) {
						await showSize(outdir);
					}
				}
			} else {
				const options = {
					...getOptions(true, prod),
					entryPoints: [join(srcDir, dir, "index.ts")],
					outfile: join(outDir, dir + ".js"),
					external: ["../share/*"],
					plugins: [
						{
							name: "rewrite-imports",
							setup(build) {
								build.onResolve({ filter: /^\.\.\/share\// }, (args) => {
									// Transform ../share/foo to ./share/foo
									const newPath = args.path.replace(/^\.\.\/share\//, "./share/");
									return { path: newPath, external: true };
								});
							},
						},
					],
				};

				if (watch) {
					const ctx = await context(options);
					await ctx.watch();
					contexts.push(ctx);
				} else {
					await build(options);
				}
			}
		}

		// Build entry points
		if (!watch) {
			console.log("Building others...");
		}
		const entryFiles = (await glob("*.{ts,tsx}", { cwd: srcDir })).filter(
			(f) => !f.startsWith("share/")
		);
		const options = {
			...getOptions(true, prod, watch),
			entryPoints: entryFiles.map((f) => join(srcDir, f)),
			outdir: outDir,
			external: ["./share/*"],
		};

		if (watch) {
			const ctx = await context(options);
			await ctx.watch();
			contexts.push(ctx);
		} else {
			await build(options);
			if (!watch) {
				await showSize(outDir);
			}
		}

		return contexts;
	} catch (error) {
		console.error("Build failed:", error);
		process.exit(1);
	}
}

async function runBuild(prod, watch = false) {
	console.log(watch ? "Starting watch mode..." : "Build scripts");
	const contexts = [];
	const scriptContexts = await buildScripts(prod, watch);

	if (watch) {
		if (scriptContexts) contexts.push(...scriptContexts);

		console.log("👀 Watching for file changes... Press Ctrl+C to stop.");

		// Handle graceful shutdown
		process.on("SIGINT", async () => {
			console.log("\n🛑 Stopping watch mode...");
			await Promise.all(contexts.map((ctx) => ctx.dispose()));
			process.exit(0);
		});
	}
}

async function main() {
	try {
		// Check if watch mode is requested
		const watchMode = process.argv.includes("--watch") || process.argv.includes("-w");
		const prod = process.argv.includes("--prod");

		await runBuild(prod, watchMode);

		if (!watchMode) {
			console.log("🚀 Build completed!");
		}
	} catch (error) {
		console.error("❌ Build process failed:", error);
		process.exit(1);
	}
}

main();
