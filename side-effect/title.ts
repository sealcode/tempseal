import { SideEffect } from "./side-effect";
import { MD5 } from "object-hash";

export class TitleSideEffect extends SideEffect {
	title: string;
	static identifier = "title";
	constructor(title: string) {
		super();
		this.title = title;
	}
	async hash() {
		return MD5(this.title);
	}
}
