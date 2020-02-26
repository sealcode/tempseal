import { Observable, Subject } from "rxjs";
import { partition, tap, merge, shareReplay, find } from "rxjs/operators";
import { Readable } from "stream";
import * as path from "path";

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
		const promises = [];
		const add_effect = (effect: SideEffect) => {
			subscriber.next(effect);
			return effect;
		};
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
	}).pipe(shareReplay());
}

function deduplicate(effects: Observable<SideEffect>) {
	return new Observable(subscriber => {
		const hashes = new Set();
		effects.subscribe(
			async (effect: SideEffect) => {
				const hash = await effect.getHash();
				if (!hashes.has(hash)) {
					hashes.add(hash);
					subscriber.next(effect);
				}
			},
			null,
			() => {
				subscriber.complete();
			}
		);
	});
}

async function findInStream<T>(
	stream: Observable<T>,
	predicate: (T) => boolean
) {
	return new Promise(function(resolve) {
		stream.pipe(find(predicate)).subscribe((match: SideEffects.File) => {
			resolve(match);
		});
	});
}

function replaceUrlPlaceholders(effects: Observable<SideEffect>) {
	return new Observable<SideEffect>(subscriber => {
		const promises = [];
		effects.subscribe(
			effect => {
				if (effect instanceof SideEffects.HtmlChunk) {
					const find_promise = findInStream(effects, file_effect => {
						return (
							file_effect instanceof SideEffects.File &&
							effect
								.getReferencedHashes()
								.includes(file_effect._hash)
						);
					}).then((match: SideEffects.File) => {
						if (match)
							subscriber.next(
								new SideEffects.HtmlChunk(
									effect.chunk.replace(
										`#{${match._hash}}`,
										match.getURL(".")
									)
								)
							);
					});
					promises.push(find_promise);
				} else {
					subscriber.next(effect);
				}
			},
			null,
			async () => {
				await Promise.all(promises);
				subscriber.complete();
			}
		);
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
				subscriber.complete();
			}
		);
	});
	return other_effects.pipe(merge(constructed_html));
}

interface WriteEvent {
	message: string;
}

const write = (output_dir: string) =>
	function(
		file_effects: Observable<SideEffects.File>
	): Observable<WriteEvent> {
		return new Observable(subscriber => {
			const promises = [];
			file_effects.subscribe(
				(effect: SideEffects.File) => {
					promises.push(
						effect.write(output_dir).then(result =>
							subscriber.next({
								message: result.path.replace(output_dir, "")
							})
						)
					);
				},
				null,
				() => subscriber.complete()
			);
		});
	};

async function test() {
	const start = Date.now();
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
			component_name: "button",
			props: { hehe: "hihi", text: "i come from props" }
		},
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
				image_path: path.resolve(__dirname, "./components/image.png")
			}
		}
	]);
	effects
		.pipe(
			replaceUrlPlaceholders,
			combineHtmlFile,
			write(path.resolve(__dirname, "public"))
		)
		.subscribe(
			effect => {
				console.log(effect.message);
				// effect.write(path.resolve(__dirname, "public"));
			},
			null,
			() => console.log(Date.now() - start, "ms")
		);
}

test();
