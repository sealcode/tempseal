import { PropControl } from "./prop-control";
import { SideEffect } from "./side-effect/side-effect";
import { Context } from "./context";

export interface RenderResult {
	result: string;
	side_effects: Array<SideEffect>;
}

export interface IComponent {
	// (context: Context, props: Object): RenderResult;
	(props: any): RenderResult | Promise<RenderResult>;
	identifier?: string;
}
