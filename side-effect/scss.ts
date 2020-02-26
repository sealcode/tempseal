import { MD5 } from "object-hash";
import * as scss from "node-sass";
import * as assert from "assert";
import { readFile } from "fs";
import { promisify } from "util";
import { isAbsolute } from "path";

import { MetaSideEffect, SideEffect } from "./side-effect";
import { CssSideEffect } from "./css";

export class ScssSideEffect extends MetaSideEffect {
	stylesheet_getter: () => Promise<string> | string;
	name: "scss";
	constructor(stylesheet_getter: () => Promise<string> | string) {
		super();
		this.stylesheet_getter = stylesheet_getter;
	}
	static async addFromPath(
		add_effect: (effect: SideEffect) => SideEffect,
		path: string
	): Promise<void> {
		assert.ok(isAbsolute(path), `Path '${path}' is not an absolute path`);
		add_effect(
			new CssSideEffect(async () => {
				const data = await promisify(readFile)(path, {
					encoding: "utf-8"
				});
				return (
					await promisify(scss.render)({
						data
					})
				).css.toString();
			})
		);
	}
	async hash() {
		return MD5(await this.stylesheet_getter());
	}
}
