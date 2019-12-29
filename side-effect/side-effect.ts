import { v4 as uuidv4 } from "uuid";

export abstract class SideEffect {
	abstract hash(): Promise<string>;
	_hash: string;
	url_placeholder: string;
	equivalent_url_placeholders: Array<string>; // if there's another side effect in the list of the same hash, it's removed from the list and it's url is put in an already existing side offect of the same hash
	constructor() {
		this._hash = null;
		this.url_placeholder = `#{${uuidv4()}}`;
		this.equivalent_url_placeholders = [];
	}
	async getHash(): Promise<string> {
		return this._hash || (await this.hash());
	}
	addEquivalentUrlPlaceholder(placeholder: string) {
		this.equivalent_url_placeholders.push(placeholder);
	}
	addEquivalentUrlPlaceholders(placeholders: Array<string>) {
		for (let placeholder of placeholders) {
			this.addEquivalentUrlPlaceholder(placeholder);
		}
	}
	mergePlaceholdersWith(effect: SideEffect) {
		this.addEquivalentUrlPlaceholder(effect.url_placeholder);
		this.addEquivalentUrlPlaceholders(effect.equivalent_url_placeholders);
	}
	static placeholderRegex = /\#\{.*\}/g;
}
