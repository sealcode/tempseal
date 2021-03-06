import { SideEffectWithPlaceholders } from "./side-effect";
import { MD5 } from "object-hash";
import { readFile } from "fs";
import { promisify } from "util";

export class CssSideEffect extends SideEffectWithPlaceholders {
	cached_stylesheet: string;
	stylesheet_getter: () => Promise<string>;
	constructor(stylesheetGetter: () => Promise<string>, hash?: string);
	constructor(stylecheet: string, hash?: string);
	constructor(
		stylesheetOrGetter: (() => Promise<string>) | string,
		hash?: string
	) {
		super();
		if (hash) {
			this._hash = hash; // this will skip running getStylesheet when getting hash;
		}
		this.type_name = "css";
		if (stylesheetOrGetter instanceof Function) {
			this.stylesheet_getter = stylesheetOrGetter;
		} else {
			this.cached_stylesheet = stylesheetOrGetter;
		}
	}
	getContent() {
		return this.getStylesheet();
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
