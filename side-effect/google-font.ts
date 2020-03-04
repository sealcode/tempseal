import { MetaSideEffect } from "./side-effect";

export class GoogleFontSideEffect extends MetaSideEffect {
	family: string;
	weight: number;
	constructor(family: string, weight: number) {
		super();
		this.family = family;
		this.weight = weight;
	}
	async hash() {
		return "google-fonts-" + this.family + "-" + this.weight;
	}
}
