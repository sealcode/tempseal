import { SideEffects } from "..";

export abstract class SideEffect {
	abstract hash(): Promise<string>;
	_hash: string;
	url_placeholder: string;
	performed = false;
	constructor() {
		this._hash = null;
	}
	async getHash(): Promise<string> {
		if (!this._hash) {
			this._hash = await this.hash();
		}
		return this._hash;
	}
	async getUrlPlaceholder() {
		return `#{${await this.getHash()}}`;
	}
	markAsDone() {
		this.performed = true;
	}
	static placeholderRegex = /\#\{.*\}/g;
}

export abstract class MetaSideEffect extends SideEffect {
	// a meta-side effect is a side effect that produces its own side effects
}
