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
	async perform(): Promise<Array<SideEffect>> {
		const result = await promisify(scss.render)({
			data: await this.stylesheet_getter()
		});

		return [new CssSideEffect(result.css.toString())];
	}
	static async fromPath(path: string): Promise<ScssSideEffect> {
		assert.ok(isAbsolute(path), `Path '${path}' is not an absolute path`);
		return new ScssSideEffect(function() {
			return new Promise(function(resolve, reject) {
				readFile(path, { encoding: "utf-8" }, (err, result) => {
					if (err) {
						reject(err);
					} else {
						resolve(result);
					}
				});
			});
		});
	}
	async hash() {
		return MD5(await this.stylesheet_getter());
	}
}
