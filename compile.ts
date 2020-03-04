import { ComponentMap, TempsealDocument, Config } from "./";
import { Operators, emitEffects } from "./compile-pipeline";
import { WriteEvent } from "./compile-pipeline/operators";
import { SideEffect } from "./side-effect/side-effect";
import { SideEffects } from "./";

export async function compile(
	components: ComponentMap,
	document: TempsealDocument,
	config: Config.Config,
	output_dir: string
) {
	const start = Date.now();

	return new Promise((resolve, reject) => {
		emitEffects(components, config, document)
			.pipe(
				Operators.replaceUrlPlaceholders("./"),
				Operators.combineHtml((body, subscriber) =>
					subscriber.next(
						new SideEffects.File("index.html", () => body, [body])
					)
				),
				Operators.write(output_dir)
			)
			.subscribe(
				(effect: WriteEvent) => {
					console.log(effect.message);
				},
				null,
				() => {
					console.log(Date.now() - start, "ms");
					resolve();
				}
			);
	});
}
