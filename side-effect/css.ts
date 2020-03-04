import { SideEffect } from "./side-effect";
import { MD5 } from "object-hash";
import { readFile } from "fs";
import { promisify } from "util";

export class CssSideEffect extends SideEffect {
	cached_stylesheet: string;
	stylesheet_getter: () => Promise<string>;
	constructor(stylesheetGetter: () => Promise<string>);
	constructor(stylecheet: string);
	constructor(stylesheetOrGetter: (() => Promise<string>) | string) {
		super();
		this.type_name = "css";
		if (stylesheetOrGetter instanceof Function) {
			this.stylesheet_getter = stylesheetOrGetter;
		} else {
			this.cached_stylesheet = stylesheetOrGetter;
		}
	}
	async getStylesheet() {
		if (!this.cached_stylesheet) {
			this.cached_stylesheet = await this.stylesheet_getter();
		}
		return this.cached_stylesheet;
	}
	async hash() {
		return MD5(await this.getStylesheet());
	}
	static fromFile(path: string) {
		return new CssSideEffect(async () => {
			return promisify(readFile)(path, { encoding: "utf-8" });
		});
	}
}
