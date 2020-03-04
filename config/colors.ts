import { default as Color } from "color";

export interface IColorsConfigObject {
	primary?: string;
	secondary?: string;
	"primary-text-on-primary"?: string;
	"primary-text-on-secondary"?: string;
	"primary-text-on-white"?: string;
	"secondary-text-on-white"?: string;
	[colorName: string]: string | undefined;
}

export class ColorsConfig {
	"primary": string;
	"secondary": string;
	"primary-text-on-primary": string;
	"primary-text-on-secondary": string;
	"primary-text-on-white": string;
	"secondary-text-on-white": string;
	"primary-text-on-primary_secondary": string;
	"secondary-text-on-primary_secondary": string;
	"primary-00": string;
	"primary-01": string;
	"primary-02": string;
	"primary-03": string;
	"primary-04": string;
	"primary-05": string;
	"primary-06": string;
	"primary-07": string;
	"primary-08": string;
	"primary-09": string;
	"primary-10": string;
	"secondary-00": string;
	"secondary-01": string;
	"secondary-02": string;
	"secondary-03": string;
	"secondary-04": string;
	"secondary-05": string;
	"secondary-06": string;
	"secondary-07": string;
	"secondary-08": string;
	"secondary-09": string;
	"secondary-10": string;
	[colorName: string]: string;

	constructor(colors_config: IColorsConfigObject) {
		if (colors_config.primary) {
			this.primary = colors_config.primary;
		} else {
			this.primary = "#5c80bc"; //random default value
		}

		if (colors_config.secondary) {
			this.secondary = colors_config.secondary;
		} else {
			this.secondary = Color(this.primary)
				.rotate(180)
				.hex();
		}

		for (const variant_a of ["primary", "secondary"]) {
			for (const variant_b of ["primary", "secondary", "white"]) {
				const variant_name = `${variant_a}-text-on-${variant_b}`;
				const color_value = colors_config[variant_name];
				if (color_value) {
					this[variant_name] = color_value;
				} else {
					this[variant_name] = Color(
						colors_config[variant_b]
					).isDark()
						? "white"
						: "black";
				}
			}
		}

		for (const variant of ["primary", "secondary"] as (
			| "primary"
			| "secondary"
		)[]) {
			const color = Color(this[variant]);
			const hue = color.hue();
			const saturationl = color.saturationl();
			for (let i = 0; i <= 10; i++) {
				this[`${variant}-${i < 10 ? 0 : ""}${i}`] = Color({
					h: hue,
					s: saturationl,
					l: (i / 10) * 100
				}).hex();
			}
		}
	}
}
