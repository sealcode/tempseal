import { promises as fs_promises } from "fs";
import * as assert from "assert";
import makeDir from "make-dir";
import {
	TempsealDocument,
	renderToFile,
	ComponentMap,
	IComponent,
	SideEffects,
	Config,
} from "../";

const primary = "#6d4477";
const secondary = "#55a4b4";
const example_config = new Config.Config({
	colors: {
		primary,
		secondary,
		"title-text-on-primary": "white",
		"body-text-on-primary": "white",
		"title-text-on-secondary": "white",
		"body-text-on-secondary": "white",
		"title-text-on-white": secondary,
		"body-text-on-white": "#333",
	},
	fonts: {
		body: "Zilla Slab",
		title: "Raleway",
	},
	layout: {
		"container-width": "1200px",
	},
});

describe("render pipeline", () => {
	before(async () => {
		await makeDir("/tmp/tempseal");
	});

	it("works", async () => {
		const document: TempsealDocument = {
			language: "en",
			segments: [
				{
					component_name: "test-component",
					props: { name: "happy seal" },
				},
			],
		};

		const component: IComponent = async function (
			context,
			{ name }: { name: string }
		) {
			await context.add_effect(
				new SideEffects.HtmlChunk(/* HTML */ `<h1>Hello, ${name}!</h1>`)
			);
		};
		component.identifier = "test-component";
		const component_map = new ComponentMap([component]);

		await renderToFile(
			component_map,
			new Config.Config(example_config),
			"/",
			"/index.html",
			"/tmp/tempseal/public",
			document
		);
		const content = await fs_promises.readFile(
			"/tmp/tempseal/public/index.html",
			"utf-8"
		);
		assert.ok(
			content.includes(`<h1>Hello, happy seal!</h1>`),
			"Crucial HTML missing"
		);
	});
});
