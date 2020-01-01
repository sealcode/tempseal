import { SideEffect } from "./side-effect";
import { MD5 } from "object-hash";

export class ScssSideEffect extends SideEffect {
	stylesheet: string;
	name: "scss";
	constructor(stylesheet: string) {
		super();
		this.stylesheet = stylesheet;
	}
	async hash() {
		return MD5(this.stylesheet);
	}
}
