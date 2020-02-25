import { resolve } from "path";
import { Observable, Subject } from "rxjs";
import { partition, merge } from "rxjs/operators";
import { Readable } from "stream";
import { resolve } from "path";

import {
	ComponentMap,
	TempsealDocument,
	IComponent,
	SideEffect,
	SideEffects,
	MetaSideEffect,
	getComponents
} from "./";

function emitEffects(
	components: ComponentMap,
	document: TempsealDocument
): Observable<SideEffect> {
	return new Observable<SideEffect>(subscriber => {
		console.log("=====\n  Emitting effects anew\n=====");
		const promises = [];
		const add_effect = (effect: SideEffect) => subscriber.next(effect);
		for (let { component_name, props } of document) {
			let component: IComponent;
			try {
				component = components.get(component_name);
			} catch (e) {
				throw new Error(`Unknown component: '${component_name}'`);
			}
			promises.push(component(add_effect, props));
		}
		Promise.all(promises).then(() => subscriber.complete());
	});
}

function combineHtmlFile(
	effects: Observable<SideEffect>
): Observable<SideEffect> {
	const capture_types = [
		SideEffects.Title,
		SideEffects.HtmlChunk,
		SideEffects.Css
	];
	const [captured_effects, other_effects] = partition(effect =>
		capture_types.some(t => effect instanceof t)
	)(effects) as [Observable<SideEffect>, Observable<SideEffect>];

	let title = "";
	let style = "";
	let body = "";

	const promises = [];

	const constructed_html = new Observable<SideEffect>(subscriber => {
		captured_effects.subscribe(
			effect => {
				if (effect instanceof SideEffects.Title) {
					title = effect.title;
				} else if (effect instanceof SideEffects.Css) {
					promises.push(
						(async () => {
							style += await effect.getStylesheet();
						})()
					);
				} else if (effect instanceof SideEffects.HtmlChunk) {
					body += effect.chunk;
				}
			},
			null,
			async () => {
				await Promise.all(promises);
				const content = /* HTML */ `
					<!DOCTYPE html>
					<html>
						<head>
							<title>${title}</title>
							<style>
								${style}
							</style>
						</head>
						<body>
							${body}
						</body>
					</html>
				`;
				subscriber.next(
					new SideEffects.File(
						"index.html",
						() => Readable.from(content),
						[content]
					)
				);
			}
		);
	});
	return other_effects.pipe(merge(constructed_html));
}

async function test() {
	const effects = emitEffects(getComponents(), [
		{
			component_name: "button",
			props: { hehe: "hihi", text: "i come from props" }
		},
		{
			component_name: "button",
			props: { hehe: "hihi", text: "i come from props" }
		},
		{
			component_name: "thumbnail-paragraph",
			props: {
				image_path: resolve(__dirname, "./components/image.png")
			}
		}
	]);
	effects.pipe(combineHtmlFile).subscribe(effect => {
		console.log(effect);
		effect.write(resolve(__dirname, "public"));
	});
}

test();
