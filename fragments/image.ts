import sharp from "sharp";
import classnames from "classnames";
import { IFragment, SideEffects } from "../";

let Image: IFragment<IImageProps>;

export interface IImageProps {
	path: string;
	alt: string;
}

Image = async (context, { path, alt }) => {
	const image_effect_promise = SideEffects.File.fromPath(path);
	const [{ width, height }, url_placeholder] = await Promise.all([
		sharp(path).metadata(),
		image_effect_promise.then(image => image.getUrlPlaceholder()),
		image_effect_promise.then(image => context.add_effect(image))
	]);
	return /* HTML */ `
		<img
			class="${classnames(
				"img",
				width &&
					height && {
						"img--horizontal": width > height,
						"img--vertical": height > width,
						"img--square": height === width
					}
			)}"
			src="${url_placeholder}"
			width="${width}"
			height="${height}"
			alt="${alt}"
		/>
	`;
};

export default Image;
