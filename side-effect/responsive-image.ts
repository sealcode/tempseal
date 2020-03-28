import { default as sharp } from "sharp";

import { SideEffects, Context } from "../";

/*
    image_path: string
	resolutions: array of sizes ie. [200, 150 ...]
	quality: number, quality of the resized image
    sizes_attr: string, sizes attribute for responsive img html tag
    alt: string, img's alt attribute
*/

async function generate_resolutions({ width }: { width?: number }) {
	if (!width) {
		throw new Error("Could not determine image's width!");
	}
	const resolutions = [];
	for (let i = 100; i <= width; i += 100) {
		resolutions.push(i);
	}
	for (let i = 10; i < 100; i += 10) {
		resolutions.push(i);
	}
	resolutions.push(width);
	return resolutions;
}

export interface IResponsiveImageArgs {
	image_path: string;
	sizes_attr: string;
	alt: string;
	custom_class?: string;
	resolutions?: number[];
}

export async function ResponsiveImageSideEffect(
	context: Context,
	{
		image_path,
		sizes_attr,
		resolutions,
		alt = "",
		custom_class = "",
	}: IResponsiveImageArgs
) {
	const image = sharp(image_path);

	const { width, height } = await image.metadata();
	if (!resolutions) {
		resolutions = await generate_resolutions({ width });
	}
	const image_effect = new SideEffects.Image(image_path);
	let first_image = image_effect.toWidth(width as number);

	const sources_original: string[] = [];
	const sources_webp: string[] = [];

	await Promise.all(
		resolutions.map(async (resolution: number) => {
			const scaled_image = image_effect.toWidth(resolution);
			const scaled_image_webp = scaled_image.toFormat("webp");
			const [webp_placeholder, orig_placeholder] = await Promise.all([
				scaled_image_webp.getUrlPlaceholder(),
				scaled_image.getUrlPlaceholder(),
				context.add_effect(scaled_image),
				context.add_effect(scaled_image_webp),
			]);
			sources_original.push(`${orig_placeholder} ${resolution}w`);
			sources_webp.push(`${webp_placeholder} ${resolution}w`);
		})
	);
	//Generate appropriate responsive img tag
	const format = await first_image.getFormat();
	return /* HTML */ `<picture class="${custom_class}">
		<source type="image/webp" srcset="${sources_webp.join(",\n")}" />
		<source
			type="image/${format}"
			srcset="${sources_original.join(",\n")}"
		/>
		<img
			width="${width}"
			height="${height}"
			src="${await first_image.getUrlPlaceholder()}"
			alt=${alt}
			sizes="${sizes_attr}"
		/>
	</picture>`;
}
