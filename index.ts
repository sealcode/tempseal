import Bluebird from "bluebird";
import { Observable } from "rxjs";

export * from "./component";
export * from "./prop-control";
export * from "./components/button";
export * from "./tempseal-document";
export * from "./components/components";

// export * as SideEffects from "./side-effect/side-effects";
// import * as SideEffects from "./side-effect/side-effects";

import { SideEffect, MetaSideEffect } from "./side-effect/side-effect";

import { TempsealDocument } from "./tempseal-document";
import { SideEffectsList } from "./side-effect/side-effects-list";
import { ComponentMap } from "./components/components";
import { IComponent } from "./component";

interface CompileResult {
	result: string;
	side_effects: Observable<SideEffect>;
}

export async function compile(
	components: ComponentMap,
	document: TempsealDocument
): Promise<CompileResult> {
	const side_effects_list = new SideEffectsList();
	let result = "";
	await Bluebird.Promise.map(document, ({ component_name, props }) => {
		let component: IComponent;
		try {
			component = components.get(component_name);
		} catch (e) {
			throw new Error(`Unknown component: '${component_name}'`);
		}
		return component(props);
	}).each(async renderResult => {
		result += renderResult.result;
		await side_effects_list.addMultiple(renderResult.side_effects);
	});
	return {
		result,
		side_effects: new Observable(async subscriber => {
			const iterator = side_effects_list.hash_to_effect.values();
			while (true) {
				let { value: effect, done } = iterator.next();
				if (done) {
					// tutaj pewnie trzeba będzie emitnąć END
					break;
				}
				if (effect instanceof MetaSideEffect) {
					for (const child_effect of await effect.perform()) {
						await side_effects_list.add(child_effect);
					}
				} else {
					subscriber.next(effect);
				}
			}
			return function unsubscribe() {};
		})
	};
}

export async function write(
	compile_result: CompileResult,
	assets_dir: string,
	output_file: string
) {
	let result = compile_result.result;
	let css = "";
	let title = "";
	const tasks = [];
	for (const effect of compile_result.side_effects.toArray()) {
		if (effect instanceof SideEffects.File) {
			for (const placeholder of effect.equivalent_url_placeholders.concat(
				[effect.url_placeholder]
			)) {
				result = result.replace(
					placeholder,
					await effect.getURL("/assets")
				);
				tasks.push(effect.write(assets_dir));
			}
		} else if (effect instanceof SideEffects.Css) {
			css += effect.stylesheet;
		} else if (effect instanceof SideEffects.Title) {
			title = effect.title;
		} else {
			await effect.perform();
		}
		effect.markAsDone();
	}
	console.log(/* HTML */ `
		<html>
			<title>${title}</title>
			<style>
				${css}
			</style>
			<body>
				${result}
			</body>
		</html>
	`);
}
