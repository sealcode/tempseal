import { SideEffect } from "./side-effect";

export class SideEffectsList {
	hash_to_effect: Map<string, SideEffect>;
	constructor() {
		this.hash_to_effect = new Map() as Map<string, SideEffect>;
	}
	async add(effect: SideEffect): Promise<boolean> {
		const hash = await effect.getHash();
		if (this.hash_to_effect.has(hash)) {
			this.hash_to_effect.get(hash).mergePlaceholdersWith(effect);
			return false;
		} else {
			this.hash_to_effect.set(hash, effect);
			return true;
		}
	}
	async addMultiple(effects: Array<SideEffect>): Promise<SideEffectsList> {
		for (let effect of effects) {
			await this.add(effect);
		}
		return this;
	}
	static async fromArray(effects: Array<SideEffect>) {
		const ret = new SideEffectsList();
		await ret.addMultiple(effects);
		return ret;
	}

	toArray(): Array<SideEffect> {
		return Array.from(this.hash_to_effect.values());
	}
}
