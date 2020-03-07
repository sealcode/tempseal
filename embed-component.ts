import { IComponent, SideEffect, SideEffects, Config } from "./";

Promise.resolve("string");

export async function embedComponent<ParamType>(
	add_effect: (effect: SideEffect) => Promise<SideEffect>,
	config: Config.Config,
	params: ParamType,
	component: IComponent<ParamType>
) {
	let html = "";
	const capture_effects = async (effect: SideEffect) => {
		if (effect instanceof SideEffects.HtmlChunk) {
			html += effect.chunk;
		} else {
			await add_effect(effect);
		}
		return effect;
	};
	await component(capture_effects, config, params);
	return html;
}
