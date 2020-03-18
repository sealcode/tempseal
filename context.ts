import { SideEffect } from "./side-effect/side-effect";
import { Config } from ".";

type TAddEffectFn = (
	effect: SideEffect | Promise<SideEffect>
) => Promise<SideEffect>;

export default class Context {
	add_effect: TAddEffectFn;
	config: Config.Config;
	constructor(add_effect: TAddEffectFn, config: Config.Config) {
		this.add_effect = add_effect;
		this.config = config;
	}
}
