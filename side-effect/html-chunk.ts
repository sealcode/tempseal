import { SideEffect } from "./side-effect";
import { MD5 } from "object-hash";

let count = 0;

export class HtmlChunkSideEffect extends SideEffect {
	chunk: string;
	name: "html-chunk";
	constructor(chunk: string) {
		super();
		this.chunk = chunk;
	}
	async hash() {
		return `html-chunk-${count++}`;
	}
}
