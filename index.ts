import * as Bluebird from "bluebird";

export * from "./component";
export * from "./prop-control";
export * from "./components/button";
export * from "./tempseal-document";
export * from "./components/components";

import { TempsealDocument } from "./tempseal-document";
import { SideEffectsList } from "./side-effect/side-effects-list";
import { FileSideEffect } from "./side-effect/file";
import { CssSideEffect } from "./side-effect/css";
import { TitleSideEffect } from "./side-effect/title";
import { ComponentMap } from "./components/components";
import { Component } from "./component";

interface CompileResult {
	result: string;
	side_effects: SideEffectsList;
}

export async function compile(
	components: ComponentMap,
	document: TempsealDocument
): Promise<CompileResult> {
	const side_effects_list = new SideEffectsList();
	let result = "";
	await Bluebird.Promise.map(document, ({ component_name, props }) => {
		let component: Component;
		try {
			component = new (components.get(component_name))();
		} catch (e) {
			throw new Error(`Unknown component: '${component_name}'`);
		}
		return component.render(props);
	}).each(async renderResult => {
		result += renderResult.result;
		await side_effects_list.addMultiple(renderResult.side_effects);
	});
	return { result, side_effects: side_effects_list };
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
		if (effect instanceof FileSideEffect) {
			for (const placeholder of effect.equivalent_url_placeholders.concat(
				[effect.url_placeholder]
			)) {
				result = result.replace(
					placeholder,
					await effect.getURL("/assets")
				);
				tasks.push(effect.write("/tmp/assets"));
			}
		}
		if (effect instanceof CssSideEffect) {
			css += effect.stylesheet;
		}
		if (effect instanceof TitleSideEffect) {
			title = effect.title;
		}
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
