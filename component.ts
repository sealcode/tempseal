import { PropControl } from "./prop-control";
import { SideEffect } from "./side-effect/side-effect";

export interface RenderResult {
	result: string;
	side_effects: Array<SideEffect>;
}

export interface ComponentConstructor {
	new (): Component;
	identifier: string;
}

type Constructor<PropControl> = new (...args: any[]) => PropControl;

export abstract class Component {
	abstract _render(props: Object): Promise<RenderResult>;
	abstract props: {
		[propname: string]: {
			control: Constructor<PropControl>;
			label: string;
			default_value?: any;
		};
	};
	constructor() {}
	public async render(props: Object): Promise<RenderResult> {
		const prepared_props = {};
		for (const [prop_name, prop_desc] of Object.entries(this.props)) {
			prepared_props[prop_name] = prop_desc.default_value
				? props[prop_name] || prop_desc.default_value
				: props[prop_name];
		}
		return this._render(prepared_props);
	}
}
