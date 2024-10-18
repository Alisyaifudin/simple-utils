import { Link, type MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
	return [{ title: "Simple Utils" }, { name: "description", content: "Simple Utils" }];
};

export default function Index() {
	return (
		<main className="flex flex-col gap-2 p-2">
			<h1>Simple Utils</h1>
			<p>Hello!</p>
			<Link to="/split-pdf">Split Pdf</Link>
		</main>
	);
}
