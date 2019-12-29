export class ThumbnailParagraph {
	static identifier = "thumbnail-paragraph";
	static props = {};
	async _render({
		url,
		img_side,
		headline,
		title,
		description,
		alt_text,
		sticky = false
	}) {
		const result = /* HTML */ `
			<div
				class="thumbnail-paragraph thumbnail-paragraph--${img_side ||
					"right"}"
			>
				<div class="thumbnail ${sticky ? "thumbnail--sticky" : ""}">
					<img alt="${alt_text || ""}" src="${"adsfad"}" />
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
			side_effects: []
		};
	}
}
