import { Config, SideEffect, SideEffects } from "./";

type TAddEffectFn<T = SideEffect> = (
	effect: SideEffect | Promise<T>
) => Promise<T>;

export default class Context {
	add_effect: TAddEffectFn;
	config: Config.Config;
	language: string;
	constructor(
		add_effect: TAddEffectFn,
		config: Config.Config,
		language?: string
	) {
		this.add_effect = add_effect;
		this.config = config;
		this.language = language || "en";
	}

	async addExternalScript(src: string) {
		const script_file = await SideEffects.File.fromURL(src);
		await Promise.all([
			this.add_effect(script_file),
			script_file.getUrlPlaceholder().then((placeholder) => {
				const html = /* HTML */ `<script
					async
					src=${placeholder}
				></script>`;
				return this.add_effect(
					new SideEffects.HtmlChunk(
						html,
						"head",
						`external-script-${src}`
					)
				);
			}),
		]);
	}

	async addExternalStylesheet(href: string) {
		const sheet_file = await SideEffects.File.fromURL(href);
		await Promise.all([
			this.add_effect(sheet_file),
			sheet_file.getUrlPlaceholder().then((placeholder) => {
				const html = /* HTML */ `<link
					rel="stylesheet"
					async
					href=${placeholder}
				/>`;
				return this.add_effect(
					new SideEffects.HtmlChunk(
						html,
						"head",
						`external-sheet-${href}`
					)
				);
			}),
		]);
	}
}
