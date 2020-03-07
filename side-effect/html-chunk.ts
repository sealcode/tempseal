import { SideEffectWithPlaceholders } from "./side-effect";

let count = 0;

export class HtmlChunkSideEffect extends SideEffectWithPlaceholders {
	chunk: string;
	name: "html-chunk";
	constructor(chunk: string) {
		super();
		this.type_name = "html-chunk";
		this.chunk = chunk;
	}
	async getContent() {
		return Promise.resolve(this.chunk);
	}
	async hash() {
		return `html-chunk-${count++}`;
	}
}
