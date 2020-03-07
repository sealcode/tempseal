import { MD5 } from "object-hash";
import * as scss from "node-sass";
import { types, AsyncContext, SassFunctionCallback } from "node-sass";
import * as assert from "assert";
import { readFile } from "fs";
import { promisify } from "util";
import { isAbsolute, resolve as path_resolve } from "path";

import { MetaSideEffect, SideEffect } from "./side-effect";
import { SideEffects } from "../";
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

	preamble_elements.push(`$colors:(`);
	for (let [color_name, color_value] of Object.entries(config.colors)) {
		preamble_elements.push(`${color_name}: ${color_value},`);
	}
	preamble_elements.push(`);`);

	preamble_elements.push(`
	@mixin font($type, $weight:400){
		font-family: _font($type, $weight);
		font-weight: $weight;
    }
`);

	preamble_elements.push(`
	@function px-to-rem($px) {
		@return #{$px / ${config.layout["rem-size"]}}rem;
	}
						   `);
	preamble_elements.push(
		`$layout-container-width: ${config.layout["container-width"]};`
	);

	preamble_elements.push(`
	*{
		@include font("body", 400)

	}
    h1,h2,h3,h4,h5,h6{
		@include font("title", 700)
	}
    `);
	const preamble = preamble_elements.join("\n");
	console.log(preamble);
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
		scss_file_path: string
	): Promise<void> {
		assert.ok(
			isAbsolute(scss_file_path),
			`Path '${scss_file_path}' is not an absolute path`
		);
		await add_effect(
			new CssSideEffect(async () => {
				const data = await promisify(readFile)(scss_file_path, {
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
							},
							"asset($asset_path)": (
								asset_path: types.String,
								done: SassFunctionCallback
							) => {
								Promise.resolve().then(async () => {
									const path_to_asset = path_resolve(
										scss_file_path,
										"../",
										asset_path.getValue()
									);
									const effect: SideEffect = await SideEffects.File.fromPath(
										path_to_asset
									);
									await add_effect(effect);
									done(
										types.String(
											await effect.getUrlPlaceholder()
										)
									);
								});
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
