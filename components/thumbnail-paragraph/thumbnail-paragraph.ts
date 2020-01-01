import { Component } from "../../component";
import { FileSideEffect } from "../../side-effect/file";
import { Props } from "./thumbnail-paragraph.props";

export class ThumbnailParagraph extends Component {
	static identifier = "thumbnail-paragraph";
	props = Props;
	async _render({
		image_path,
		img_side,
		headline,
		title,
		description,
		alt_text,
		sticky = false
	}) {
		// need to add styles
		const image = await FileSideEffect.fromPath(image_path);
		const result = /* HTML */ `
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
		`;
		return {
			result,
			side_effects: [image]
		};
	}
}
