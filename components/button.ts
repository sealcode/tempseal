import path from "path";
import { Component } from "../component";
import { Text } from "../prop-controls/text";
import { CssSideEffect } from "./../side-effect/css";
import { TitleSideEffect } from "../side-effect/title";
import { FileSideEffect } from "./../side-effect/file";

export class Button extends Component {
	static identifier = "button";
	props = {
		text: { control: Text, label: "text", default_value: "I'm a button" }
	};
	async _render({ text }) {
		const image = await FileSideEffect.fromPath(
			path.resolve(__dirname, "./image.png")
		);
		return {
			result: /* HTML */ `
				<button>
					<img src="${image.url_placeholder}" />
					${text}
				</button>
			`,
			side_effects: [
				new CssSideEffect(/* CSS */ `
					button { backgorund-color: red; color: white;}
					`),
				image,
				new TitleSideEffect("Moja strona")
			]
		};
	}
}
