export interface IFontsConfigObject {
	title?: string;
	body?: string;
	sans?: string;
	serif?: string;
	slab?: string;
	mono?: string;
}

export class FontsConfig {
	title: string;
	body: string;
	sans: string;
	serif: string;
	slab: string;
	mono: string;
	[font_type: string]: string | Function;
	constructor(fonts: IFontsConfigObject) {
		this.title = fonts.title || "Zilla Slab";
		this.body = fonts.body || "Zilla Slab";
		this.sans = fonts.sans || "Raleway";
		this.serif = fonts.serif || "Martel";
		this.slab = fonts.slab || "Zilla Slab";
		this.mono = fonts.mono || "Fira Mono";
	}

	getFamily(font_type: string) {
		return (this[font_type] as string) || null;
	}
}
