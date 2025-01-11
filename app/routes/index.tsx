import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
	return [{ title: "Simple utils" }];
};

export default function Index() {
	return (
		<main className="flex h-screen justify-center p-2">
			<ul className="flex gap-5">
				<li>
					<Button asChild className="w-32 h-24 text-2xl">
						<Link to="/split-pdf" className="text-wrap" prefetch="intent">
							Split PDF
						</Link>
					</Button>
				</li>
				{/* <li>
					<Button asChild className="w-32 h-24 text-2xl">
						<Link to="/video-converter" className="text-wrap" prefetch="intent">
							Video Converter
						</Link>
					</Button>
				</li> */}
				<li>
					<Button asChild className="w-32 h-24 text-2xl">
						<Link to="/video-clipper" className="text-wrap" prefetch="intent">
							Video Clipper
						</Link>
					</Button>
				</li>
				<li>
					<Button asChild className="w-32 h-24 text-2xl">
						<Link to="/image-converter" className="text-wrap" prefetch="intent">
							Image Converter
						</Link>
					</Button>
				</li>
			</ul>
		</main>
	);
}
