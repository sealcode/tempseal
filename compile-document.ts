// import {
// 	ComponentMap,
// 	TempsealDocument,
// 	IComponent,
// 	SideEffect,
// 	SideEffects,
// 	MetaSideEffect,
// 	getComponents
// } from "./";
// import * as path from "path";
// import { Observable, Subject } from "rxjs";
// import { partition, tap, finalize } from "rxjs/operators";

// export async function extractSideEffectsFromDocument(
// 	components: ComponentMap,
// 	document: TempsealDocument
// ): Promise<Observable<SideEffect>> {
// 	const side_effects = new Subject() as Subject<SideEffect>;
// 	const hashes = new Set();
// 	const deduplicated_side_effects = new Subject();
// 	side_effects.subscribe(async (effect: SideEffect) => {
// 		const hash = await effect.getHash();
// 		if (!hashes.has(hash)) {
// 			hashes.add(hash);
// 			deduplicated_side_effects.next(effect);
// 		}
// 	});
// 	const [meta_side_effects, regular_side_effects] = partition(
// 		effect => effect instanceof MetaSideEffect
// 	)(deduplicated_side_effects);
// 	meta_side_effects.subscribe(async (meta_effect: MetaSideEffect) => {
// 		(await meta_effect.perform()).forEach((effect: SideEffect) => {
// 			side_effects.next(effect);
// 			// side_effects.complete();
// 		});
// 	});

// 	//// dlaczego jak daję await to wyświetla się tylko jeden, ostatni efekt? Być może to wszystko trzeba będzie zrobić jednym pipe'm...

// 	for (let { component_name, props } of document) {
// 		let component: IComponent;
// 		try {
// 			component = components.get(component_name);
// 		} catch (e) {
// 			throw new Error(`Unknown component: '${component_name}'`);
// 		}
// 		await component(side_effects, props);
// 	}
// 	return regular_side_effects as Observable<SideEffect>;
// }

// export function compileHtmlPage(side_effects: Subject<SideEffect>) {
// 	let content;
// 	let title;
// 	let style;
// 	const transformed = new Subject() as Subject<SideEffect>;
// 	const capture_types = [
// 		SideEffects.Title,
// 		SideEffects.HtmlChunk,
// 		SideEffects.Css
// 	];

// 	const [captured_effects, other_effects] = partition(effect =>
// 		capture_types.some(t => effect instanceof t)
// 	)(side_effects);

// 	captured_effects
// 		.pipe(finalize(() => console.log("end!")))
// 		.subscribe((effect: SideEffect) => {
// 			// console.log(effect);
// 			if (effect instanceof SideEffects.Title) {
// 				title = effect.title;
// 			} else if (effect instanceof SideEffects.Css) {
// 				style += effect.stylesheet;
// 			} else if (effect instanceof SideEffects.HtmlChunk) {
// 				content += effect.chunk;
// 			} else {
// 				transformed.next(effect);
// 			}
// 		});
// 	return other_effects;
// }

// async function test() {
// 	(
// 		await extractSideEffectsFromDocument(getComponents(), [
// 			{
// 				component_name: "button",
// 				props: { hehe: "hihi", text: "i come from props" }
// 			},
// 			{
// 				component_name: "button",
// 				props: { hehe: "hihi", text: "i come from props" }
// 			},
// 			{
// 				component_name: "thumbnail-paragraph",
// 				props: {
// 					image_path: path.resolve(
// 						__dirname,
// 						"./components/image.png"
// 					)
// 				}
// 			}
// 		])
// 	)
// 		// .pipe(compileHtmlPage)
// 		.subscribe(console.log);
// }

// test();
