import { SideEffects, Config } from "..";

export abstract class SideEffect {
	abstract hash(): Promise<string>;
	_hash: string | null;
	url_placeholder: string;
	performed = false;
	type_name: string;
	public order: number;
	constructor(public config?: Config.Config | undefined) {
		this._hash = null;
	}
	setOrder(order: number) {
		this.order = order;
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
	public config: Config.Config;
	// a meta-side effect is a side effect that produces its own side effects
}

export abstract class SideEffectWithPlaceholders extends SideEffect {
	abstract getContent(): Promise<string>;
	async getReferencedHashes(): Promise<string[]> {
		return (
			(await this.getContent()).match(/\#\{[-a-zA-Z0-9]+\}/g) || []
		).map(s => s.replace(/[\{\}\#]/g, ""));
	}
}
