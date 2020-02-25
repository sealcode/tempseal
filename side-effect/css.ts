import { SideEffect } from "./side-effect";
import { MD5 } from "object-hash";

export class CssSideEffect extends SideEffect {
	cached_stylesheet: string;
	stylesheet_getter: () => Promise<string>;
	name: "css";
	constructor(stylesheetGetter: () => Promise<string>);
	constructor(stylecheet: string);
	constructor(stylesheetOrGetter: (() => Promise<string>) | string) {
		super();
		if (stylesheetOrGetter instanceof Function) {
			this.stylesheet_getter = stylesheetOrGetter;
		} else {
			console.log("setting style!", stylesheetOrGetter);
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
}
