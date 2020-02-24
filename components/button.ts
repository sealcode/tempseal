import path from "path";
import { IComponent, SideEffects } from "../";

export let button: IComponent;
button = async function({ text }: { text: string }) {
	const image = await SideEffects.File.fromPath(
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
			new SideEffects.Css(/* CSS */ `
					button { backgorund-color: red; color: white;}
					`),
			image,
			new SideEffects.Title("Moja strona")
		]
	};
};

button.identifier = "button";
