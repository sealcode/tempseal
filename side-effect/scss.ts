import { MD5 } from "object-hash";
import * as scss from "node-sass";
import { types, AsyncContext, SassFunctionCallback } from "node-sass";
import * as assert from "assert";
import { readFile } from "fs";
import { promisify } from "util";
import { isAbsolute } from "path";

import { MetaSideEffect, SideEffect } from "./side-effect";
import { CssSideEffect } from "./css";
import { GoogleFontSideEffect } from "./google-font";
import { Config } from "../";

const config_preambles = new WeakMap<Config.Config, string>();

function get_config_preamble(config: Config.Config): string {
	if (config_preambles.has(config)) {
		return config_preambles.get(config) as string;
	}
	let preamble_elements: string[] = [];

	for (let [color_name, color_value] of Object.entries(config.colors)) {
		preamble_elements.push(`$colors-${color_name}: ${color_value};`);
	}

	preamble_elements.push(`
    @mixin font($type, $weight){
		font-family: _font($type, $weight);
		font-weight: $weight;
    }
`);

	preamble_elements.push(`
	@function px-to-rem($px) {
		@return #{$px / ${config.rem_size}}rem;
	}
`);

	const preamble = preamble_elements.join("\n");
	config_preambles.set(config, preamble);
	return preamble;
}

export class ScssSideEffect extends MetaSideEffect {
	stylesheet_getter: () => Promise<string> | string;
	name: "scss";
	constructor(
		config: Config.Config,
		stylesheet_getter: () => Promise<string> | string
	) {
		super(config);
		this.stylesheet_getter = stylesheet_getter;
	}
	static async addFromPath(
		add_effect: (effect: SideEffect) => Promise<SideEffect>,
		config: Config.Config,
		path: string
	): Promise<void> {
		assert.ok(isAbsolute(path), `Path '${path}' is not an absolute path`);
		await add_effect(
			new CssSideEffect(async () => {
				const data = await promisify(readFile)(path, {
					encoding: "utf-8"
				});
				const preamble = get_config_preamble(config);
				return (
					await promisify(scss.render)({
						data: preamble + data,
						functions: {
							"_font($type, $weight)": (
								font_type: types.String,
								weight: types.Number,
								done: SassFunctionCallback
							) => {
								const font_family = config.fonts.getFamily(
									font_type.getValue()
								);
								if (font_family) {
									add_effect(
										new GoogleFontSideEffect(
											font_family,
											weight.getValue()
										)
									);
								}
								done(
									types.String(
										font_family ||
											"ERROR - font type not found"
									)
								);
							}
						}
					})
				).css.toString();
			})
		);
	}
	async hash() {
		return MD5(await this.stylesheet_getter());
	}
}
