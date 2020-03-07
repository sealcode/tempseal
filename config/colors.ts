import { default as Color } from "color";

export interface IColorsConfigObject {
	primary?: string;
	secondary?: string;
	"body-text-on-primary"?: string;
	"title-text-on-primary": string;
	"body-text-on-secondary"?: string;
	"title-text-on-secondary"?: string;
	"title-text-on-white"?: string;
	"body-text-on-white"?: string;
	[colorName: string]: string | undefined;
}

//colors from https://clrs.cc/
const defaultBaseColors: { [color: string]: string } = {
	navy: "#001f3f",
	blue: "#0074D9",
	aqua: "#7FDBFF",
	teal: "#39CCCC",
	olive: "#3D9970",
	green: "#2ECC40",
	lime: "#01FF70",
	yellow: "#FFDC00",
	orange: "#FF851B",
	red: "#FF4136",
	maroon: "#85144b",
	fuchsia: "#F012BE",
	purple: "#B10DC9",
	black: "#111111",
	gray: "#AAAAAA",
	silver: "#ddd"
};

export class ColorsConfig {
	"primary": string;
	"secondary": string;
	"title-text-on-primary": string;
	"body-text-on-primary": string;
	"title-text-on-secondary": string;
	"body-text-on-secondary": string;
	"title-text-on-white": string;
	"body-text-on-white": string;
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

		for (const color_role of ["title", "body"]) {
			for (const color_variant of ["primary", "secondary", "white"]) {
				const variant_name = `${color_role}-text-on-${color_variant}`;
				const color_value = colors_config[variant_name];
				if (color_value) {
					this[variant_name] = color_value;
				} else {
					this[variant_name] = Color(
						colors_config[color_variant]
					).isDark()
						? "white"
						: "#333";
				}
			}
		}

		this["primary-text-on-white"] = "#333";

		for (let base_color_name in defaultBaseColors) {
			this[base_color_name] = defaultBaseColors[base_color_name];
		}

		for (const color_name of [
			"primary",
			"secondary",
			...Object.keys(defaultBaseColors)
		] as ("primary" | "secondary")[]) {
			const color = Color(this[color_name] as string);
			const hue = color.hue();
			const saturationl = color.saturationl();
			for (let i = 0; i <= 10; i++) {
				this[`${color_name}-${i < 10 ? 0 : ""}${i}`] = Color({
					h: hue,
					s: saturationl,
					l: (i / 10) * 100
				}).hex();
			}
		}
	}
}
