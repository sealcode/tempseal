import { resolve } from "path";
import { SideEffects, IComponent } from "../../";

export let ThumbnailParagraph: IComponent;

ThumbnailParagraph = async function({
	image_path,
	img_side,
	headline,
	title,
	description,
	alt_text,
	sticky = false
}) {
	const style = await SideEffects.Scss.fromPath(
		resolve(__dirname, "thumbnail-paragraph.scss")
	);
	const image = await SideEffects.File.fromPath(image_path);
	const result = /* HTML */ `
		<div
			class="thumbnail-paragraph thumbnail-paragraph--${img_side ||
				"right"}"
		>
			<div class="thumbnail ${sticky ? "thumbnail--sticky" : ""}">
				<img alt="${alt_text || ""}" src="${image.url_placeholder}" />
			</div>
			<div class="header">
				<div class="headline">${headline || ""}</div>
				<h3>${title || ""}</h3>
			</div>
			<div class="paragraph">
				${description || ""}
			</div>
		</div>
	`;

	return {
		result,
		side_effects: [image, style]
	};
};

ThumbnailParagraph.identifier = "thumbnail-paragraph";
