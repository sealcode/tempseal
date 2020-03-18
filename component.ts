import { Context, SideEffect } from ".";

export interface RenderResult {
	result: string;
	side_effects: Array<SideEffect>;
}

export interface IComponent<ParamType = any> {
	(context: Context, props: ParamType): Promise<void>;
	identifier?: string;
}
