import { SideEffect } from "./side-effect/side-effect";
import { Subject } from "rxjs";

export interface RenderResult {
	result: string;
	side_effects: Array<SideEffect>;
}

export interface IComponent {
	// (context: Context, props: Object): RenderResult;
	(
		add_effect: (effect: SideEffect) => Promise<SideEffect>,
		props: any
	): Promise<void>;
	identifier?: string;
}
