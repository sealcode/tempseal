import { IColorsConfigObject, ColorsConfig } from "./colors";
import { IFontsConfigObject, FontsConfig } from "./fonts";

export interface IConfigObject {
	colors: IColorsConfigObject;
	fonts: IFontsConfigObject;
	rem_size?: number;
}

export class Config {
	colors: ColorsConfig;
	fonts: FontsConfig;
	rem_size: number;
	constructor(config_object: IConfigObject) {
		this.colors = new ColorsConfig(config_object.colors);
		this.fonts = new FontsConfig(config_object.fonts);
		this.rem_size = config_object.rem_size || 24;
	}
}
