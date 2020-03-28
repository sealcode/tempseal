import { SideEffects } from "..";

export abstract class SideEffect {
	abstract hash(): Promise<string>;
	_hash: string | null;
	url_placeholder: string;
	performed = false;
	type_name: string;
	public order: number;
	reemit_across_documents: boolean;
	constructor(reemit_across_documents: boolean = true) {
		this._hash = null;
		this.reemit_across_documents = reemit_across_documents;
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
	markAsDone() {
		this.performed = true;
	}
	static placeholderRegex = /\#\{.*\}/g;
}

export abstract class MetaSideEffect extends SideEffect {
	// a meta-side effect is a side effect that produces its own side effects
}

export abstract class SideEffectWithPlaceholders extends SideEffect {
	abstract getContent(): Promise<string>;
	async getReferencedHashes(): Promise<string[]> {
		return (
			(await this.getContent()).match(/\#\{[-a-zA-Z0-9]+\}/g) || []
		).map((s) => s.replace(/[\{\}\#]/g, ""));
	}
	fillMetaDataFrom(effect: SideEffectWithPlaceholders) {
		this.setOrder(effect.order);
		this._hash = effect._hash;
	}
}
export abstract class LinkableSideEffect extends SideEffect {
	abstract async write(
		output_dir: string
	): Promise<{ path: string; write_was_needed: boolean }>;
	async getUrlPlaceholder() {
		return `#{${await this.getHash()}}`;
	}
}
