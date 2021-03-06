import chalk from "chalk";

import { emitEffects } from "./compile-pipeline";
import {
	combineHtml,
	write,
	replaceUrlPlaceholders,
	downloadFonts,
} from "./compile-pipeline/operators";
import {
	Config,
	TempsealDocument,
	SideEffects,
	ComponentMap,
	SideEffect,
} from "./";

export function renderToFile(
	components: ComponentMap,
	config: Config.Config,
	base_url: string,
	html_url: string,
	public_dir: string,
	document: TempsealDocument,
	emitted_hashes: Map<string, SideEffect> = new Map()
) {
	const start = Date.now();
	return new Promise((resolve, reject) => {
		emitEffects(components, config, document, emitted_hashes)
			.pipe(
				replaceUrlPlaceholders(base_url, emitted_hashes, html_url),
				downloadFonts(public_dir, base_url),
				combineHtml((content, subscriber) => {
					const file_effect = new SideEffects.HtmlFile(
						html_url,
						content
					);
					file_effect.getHash();
					subscriber.next(file_effect);
				}),
				write(public_dir)
			)
			.subscribe(
				(e) => {
					if (e.type == "skipped") {
						console.log(chalk.gray(`Skipped ${e.file_name}`));
					} else {
						console.log(chalk.green(`Wrote ${e.file_name}`));
					}
				},
				(er) =>
					reject(
						`Error: <code><pre>${
							er.formatted ? er.formatted : er
						}\n${er.stack?.replace(/</g, "&lt;")}</pre></code>`
					),
				() => {
					console.log(
						`Rendered ${html_url} in ${Date.now() - start}ms`
					);
					resolve();
				}
			);
	});
}
