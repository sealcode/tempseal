import { resolve } from "path";
import { SideEffects, IComponent } from "../../";

export let ThumbnailParagraph: IComponent;

ThumbnailParagraph = async function(
	add_effect,
	{
		image_path,
		img_side,
		headline,
		title,
		description,
		alt_text,
		sticky = false
	}
) {
	const image = await SideEffects.File.fromPath(image_path);
	await SideEffects.Scss.addFromPath(
		add_effect,

		resolve(__dirname, "thumbnail-paragraph.scss")
	);
	add_effect(image);
	add_effect(
		new SideEffects.HtmlChunk(/* HTML */ `
			<div
				class="thumbnail-paragraph thumbnail-paragraph--${img_side ||
					"right"}"
			>
				<div class="thumbnail ${sticky ? "thumbnail--sticky" : ""}">
					<img
						alt="${alt_text || ""}"
						src="${image.url_placeholder}"
					/>
				</div>
				<div class="header">
					<div class="headline">${headline || ""}</div>
					<h3>${title || ""}</h3>
				</div>
				<div class="paragraph">
					${description || ""}
				</div>
			</div>
		`)
	);
};

ThumbnailParagraph.identifier = "thumbnail-paragraph";
