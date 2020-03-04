import path from "path";
import { IComponent, SideEffects } from "../";

export let button: IComponent;

button = async function(add_effect, config, { text }: { text: string }) {
	const image = await SideEffects.File.fromPath(
		path.resolve(__dirname, "./image.png")
	);
	await Promise.all([
		add_effect(image),

		add_effect(
			new SideEffects.Css(/* CSS */ `
		button { background-color: red; color: white;}
       `)
		),
		add_effect(new SideEffects.Title("Moja strona")),
		add_effect(
			new SideEffects.HtmlChunk(`
			<button>
				<img src="${await image.getUrlPlaceholder()}" />
				${text}
			</button>
									  `)
		)
	]);
};

button.identifier = "button";
