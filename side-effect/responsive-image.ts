import * as path from "path";
import { promisify } from "util";

import { default as sharp } from "sharp";
import * as fs from "fs";

import { SideEffects } from "../";

/*
    image_path: string
	resolutions: array of sizes ie. [200, 150 ...]
	quality: number, quality of the resized image
    sizes_attr: string, sizes attribute for responsive img html tag
    alt: string, img's alt attribute
*/

function generate_responsive_filename(image_path: string, resolution: number) {
	let image_basename = path.basename(image_path); //Extract file's name
	let extension = ".webp";
	image_basename = path.basename(image_path, extension);
	return `${image_basename}-${resolution}w${extension}`;
}

interface IResponsiveImageArgs {
	image_path: string;
	resolutions: number[];
	sizes_attr: string;
	alt: string;
	custom_class: string;
}

export async function ResponsiveImageSideEffect(
	add_effect: Function,
	{
		image_path,
		resolutions,
		sizes_attr,
		alt = "",
		custom_class = ""
	}: IResponsiveImageArgs
) {
	let first_image: SideEffects.File | null = null;
	const file_info = await promisify(fs.stat)(image_path);

	const created_files = await Promise.all(
		resolutions.map(async (resolution: number) => {
			const image = new SideEffects.File(
				generate_responsive_filename(image_path, resolution),
				() =>
					sharp(image_path)
						.resize(resolution)
						.toFormat("webp")
						.toBuffer(),

				[image_path, resolution, file_info.mtime]
			);
			await add_effect(image);
			if (!first_image) {
				first_image = image;
			}
			return `${await image.getUrlPlaceholder()} ${resolution}w`;
		})
	);
	//Generate appropriate responsive img tag
	return /* HTML  */ `<img class="${custom_class || ""}" src="${
		first_image
			? await (first_image as SideEffects.File).getUrlPlaceholder()
			: ""
	}" srcset="${created_files.join(
		",\n"
	)}" sizes="${sizes_attr}" alt="${alt}"/>`;
}
