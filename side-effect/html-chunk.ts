import { SideEffectWithPlaceholders } from "./side-effect";

let count = 0;

export class HtmlChunkSideEffect extends SideEffectWithPlaceholders {
	chunk: string;
	name: "html-chunk";
	forced_hash: string;
	public disposition: "head" | "body";
	constructor(
		chunk: string,
		disposition?: "head" | "body",
		forced_hash?: string
	) {
		super();
		this.type_name = "html-chunk";
		this.disposition = disposition || "body";
		this.chunk = chunk;
		if (forced_hash) {
			this.forced_hash = forced_hash;
		}
	}
	fillMetaDataFrom(chunk: HtmlChunkSideEffect) {
		super.fillMetaDataFrom(chunk);
		this.disposition = chunk.disposition;
		this.forced_hash = chunk.forced_hash;
	}
	async getContent() {
		return Promise.resolve(this.chunk);
	}
	async hash() {
		return this.forced_hash || `html-chunk-${count++}`;
	}
}
