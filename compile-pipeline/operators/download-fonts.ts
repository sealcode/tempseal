import { access } from "fs";
import { promisify } from "util";
import { resolve, join } from "path";
import { Observable } from "rxjs";

const GetGoogleFonts = require("get-google-fonts");

import { SideEffect, SideEffects } from "../../";

const asyncAccess = promisify(access);

export const downloadFonts = (main_output_dir: string, base_url = "/") => (
	effects: Observable<SideEffect>
) =>
	new Observable<SideEffect>((subscriber) => {
		const promises: Promise<any>[] = [];
		effects.subscribe(
			(effect: SideEffect) => {
				if (!(effect instanceof SideEffects.GoogleFont)) {
					subscriber.next(effect);
					return;
				}
				//effect is a GoogleFont effect
				const css_filename = `${effect.family}-${effect.weight}.css`;
				promises.push(
					asyncAccess(resolve(main_output_dir, "fonts", css_filename))
						.catch(async () => {
							const url =
								GetGoogleFonts.constructUrl(
									{ [effect.family]: [effect.weight] },
									["latin-ext"]
								) + "&display=swap";
							await new GetGoogleFonts().download(url, {
								outputDir: join(main_output_dir, "fonts"),
								cssFile: css_filename,
								overwriting: true,
								path: base_url + "fonts/",
							});
						})
						.finally(() => {
							subscriber.next(
								SideEffects.Css.fromFile(
									resolve(
										main_output_dir,
										"fonts",
										css_filename
									)
								)
							);
						})
				);
			},
			(e) => subscriber.error(e),
			() => {
				Promise.all(promises).then(() => {
					subscriber.complete();
				});
			}
		);
	});
