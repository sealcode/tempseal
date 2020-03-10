import * as path from "path";
import { promisify } from "util";

import { default as sharp } from "sharp";
import * as fs from "fs";

import { SideEffects, SideEffect } from "../";

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

interface IResponsiveImageArgs {
	image_path: string;
	sizes_attr: string;
	alt: string;
	custom_class?: string;
	resolutions?: number[];
}

export async function ResponsiveImageSideEffect(
	add_effect: (effect: SideEffect) => Promise<SideEffect>,
	{
		image_path,
		sizes_attr,
		resolutions,
		alt = "",
		custom_class = ""
	}: IResponsiveImageArgs
) {
	let first_image: SideEffects.File | null = null;
	const image = sharp(image_path);

	const file_info = await promisify(fs.stat)(image_path);
	const { width, height } = await image.metadata();
	if (!resolutions) {
		resolutions = await generate_resolutions({ width });
	}

	const created_files = await Promise.all(
		resolutions.map(async (resolution: number) => {
			const image_effect = new SideEffects.File(
				generate_responsive_filename(image_path, resolution),
				() =>
					image
						.resize(resolution)
						.toFormat("webp")
						.toBuffer(),
				[image_path, resolution, file_info.mtime]
			);
			await add_effect(image_effect);
			if (!first_image) {
				first_image = image_effect;
			}
			return `${await image_effect.getUrlPlaceholder()} ${resolution}w`;
		})
	);
	//Generate appropriate responsive img tag
	return /* HTML  */ `<img class="${custom_class ||
		""}" width="${width}" height="${height}" src="${
		first_image
			? await (first_image as SideEffects.File).getUrlPlaceholder()
			: ""
	}" srcset="${created_files.join(
		",\n"
	)}" sizes="${sizes_attr}" alt="${alt}"/>`;
}
