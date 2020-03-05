import { IColorsConfigObject, ColorsConfig } from "./colors";
import { IFontsConfigObject, FontsConfig } from "./fonts";
import { ILayoutConfigObject, LayoutConfig } from "./layout";

export interface IConfigObject {
	colors: IColorsConfigObject;
	fonts: IFontsConfigObject;
	layout: ILayoutConfigObject;
}

export class Config {
	colors: ColorsConfig;
	fonts: FontsConfig;
	rem_size: number;
	layout: LayoutConfig;
	constructor(config_object: IConfigObject) {
		this.colors = new ColorsConfig(config_object.colors);
		this.fonts = new FontsConfig(config_object.fonts);
		this.layout = new LayoutConfig(config_object.layout);
	}
}
