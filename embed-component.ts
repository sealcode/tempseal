import { IComponent, SideEffect, SideEffects, Config, Context } from "./";

Promise.resolve("string");

export async function embedComponent<ParamType>(
	parent_context: Context,
	params: ParamType,
	component: IComponent<ParamType>
) {
	let html = "";
	const capture_effects = async (effect: SideEffect) => {
		if (effect instanceof SideEffects.HtmlChunk) {
			html += effect.chunk;
		} else {
			await parent_context.add_effect(effect);
		}
		return effect;
	};
	const context = new Context(capture_effects, parent_context.config);
	await component(context, params);
	return html;
}
