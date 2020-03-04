import { SideEffect } from "./side-effect";

let count = 0;

export class HtmlChunkSideEffect extends SideEffect {
	chunk: string;
	name: "html-chunk";
	constructor(chunk: string) {
		super();
		this.type_name = "html-chunk";
		this.chunk = chunk;
	}
	getReferencedHashes(): Array<string> {
		return (this.chunk.match(/\#\{[-a-zA-Z0-9]+\}/g) || []).map(s =>
			s.replace(/[\{\}\#]/g, "")
		);
	}
	async hash() {
		return `html-chunk-${count++}`;
	}
}
