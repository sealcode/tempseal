import { SideEffect } from "./side-effect";
import { MD5 } from "object-hash";

export class CssSideEffect extends SideEffect {
	stylesheet: string;
	name: "css";
	constructor(stylesheet: string) {
		super();
		this.stylesheet = stylesheet;
	}
	async hash() {
		return MD5(this.stylesheet);
	}
}
