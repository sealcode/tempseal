import { SideEffect } from "./side-effect/side-effect";
import { Config } from ".";
// import { Subject } from "rxjs";

export interface RenderResult {
	result: string;
	side_effects: Array<SideEffect>;
}

export interface IComponent<ParamType = any> {
	// (context: Context, props: Object): RenderResult;
	(
		add_effect: (
			effect: SideEffect | Promise<SideEffect>
		) => Promise<SideEffect>,
		config: Config.Config,
		props: ParamType
	): Promise<void>;
	identifier?: string;
}
