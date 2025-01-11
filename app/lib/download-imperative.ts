export function download(src: string, name: string) {
	const link = document.createElement("a");
	link.href = src;
	link.download = name;
	link.style.display = "none";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
