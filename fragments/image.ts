import classnames from "classnames";
import { IFragment, SideEffects } from "../";

let Image: IFragment<IImageProps>;

export interface IImageProps {
	path?: string;
	alt: string;
	effect?: SideEffects.Image;
	target_width?: number;
	classes?: string[];
	img_style?: string;
	url_prefix?: string;
	fit?: "contain" | "cover";
}

Image = async (
	context,
	{
		path,
		alt,
		effect,
		target_width,
		classes = [],
		img_style = "",
		url_prefix = "",
		fit = "contain",
	}
) => {
	if (!path && !effect) {
		throw new Error(
			"Either path or effect need to be supplied to create an image fragment"
		);
	}
	let image_effect =
		effect ||
		new SideEffects.Image(
			path as string,
			"original",
			"original",
			url_prefix
		);
	if (target_width) {
		image_effect = image_effect.toWidth(target_width);
	}
	const image_effect_webp = image_effect.toFormat("webp");

	const base64_promise = image_effect
		.getFormat()
		.then((format: string) =>
			format !== "svg"
				? image_effect.toWidth(15).toFormat("jpg").getBase64()
				: ""
		);
	const [
		{ width, height },
		format,
		url_placeholder,
		url_placeholder_webp,
		mini_base64,
	] = await Promise.all([
		image_effect.getSize(),
		image_effect.getFormat(),
		image_effect.getUrlPlaceholder(),
		image_effect_webp.getUrlPlaceholder(),
		base64_promise,
		context.add_effect(image_effect),
		context.add_effect(image_effect_webp),
	]);
	const preload_style = mini_base64
		? `background-image: url(data:image/jpeg;base64,${mini_base64}); background-repeat: no-repeat; background-size: ${fit}; background-position: center;`
		: "";
	return /* HTML */ `
		<picture
			class="${classnames(
				...classes,
				"img",
				width &&
					height && {
						"img--horizontal": width > height,
						"img--vertical": height > width,
						"img--square": height === width,
					}
			)}"
		>
			<source srcset="${url_placeholder_webp}" type="image/webp" />
			<source srcset="${url_placeholder}" type="image/${format}" />
			<img
				src="${url_placeholder}"
				width="${width}"
				height="${height}"
				alt="${alt}"
				style="${preload_style} ${img_style}"
			/>
		</picture>
	`;
};

export default Image;
