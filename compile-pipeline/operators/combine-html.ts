import { Observable, Subscriber } from "rxjs";

import { SideEffect, SideEffects } from "../../";

export const combineHtml = (
	handle_result: (
		content: string,
		subscriber: Subscriber<SideEffect>
	) => void | Promise<void>
) =>
	function(effects: Observable<SideEffect>): Observable<SideEffect> {
		let title = "";
		let style = "";
		let html_chunk_effects: SideEffects.HtmlChunk[] = [];

		const promises = [] as Promise<any>[];

		const constructed_html = new Observable<SideEffect>(subscriber => {
			effects.subscribe(
				effect => {
					if (effect instanceof SideEffects.Title) {
						title = effect.title;
					} else if (effect instanceof SideEffects.Css) {
						promises.push(
							(async () => {
								try {
									const style_chunk = await effect.getStylesheet();
									style += style_chunk;
								} catch (e) {
									console.log("caught error!");
									subscriber.error(e);
								}
							})()
						);
					} else if (effect instanceof SideEffects.HtmlChunk) {
						html_chunk_effects.push(effect);
					} else {
						subscriber.next(effect);
					}
				},
				e => subscriber.error(e),
				async () => {
					try {
						await Promise.all(promises);
						const body = html_chunk_effects
							.sort((e1, e2) => (e1.order > e2.order ? 1 : -1))
							.map(e => e.chunk)
							.join("\n");
						const content = /* HTML */ `
							<!DOCTYPE html>
							<html>
								<head>
									<title>${title}</title>
									<style>
											body {
												padding-left: 0;
												padding-bottom: 0;
												padding-right: 0;
											}

											* {
												box-sizing: border-box;
												line-height: 1rem;
												font-size: px-to-rem(16);
												margin: 0;
											}

											p,
											ul,
											li {
												max-width: 32rem;
											}

											ul,
											ol {
												padding-left: 2rem;
											}

											img {
												vertical-align: bottom;
											}

											h1 {
												font-size: 1.75rem;
												line-height: 2rem;
											}

											h2 {
												font-size: 1.25rem;
												line-height: 2rem;
											}

											input[type="submit"] {
												cursor: pointer;
											}
											html {
												font-size: 1.5em;
												scroll-behavior: smooth;
												font-display: fallback;
											}

											html,
											body {
												min-height: 100vh;
											}

											body {
												font-size: calc( 2rem / 3 );
											}

											body,
											main {
												display: flex;
												flex-flow: column;
											}

											article,
											main {
												flex-grow: 1;
											}

											main > article {
												display: flex;
												flex-flow: column;
												& > section {
													flex-grow: 1;
												}
											}

											* {
												margin: 0;
												padding: 0;
												box-sizing: border-box;
											}

											a {
												text-decoration: none;
												cursor: pointer;
											}

											a:focus {
												outline: 2px solid #333333;
											}

											a:active,
											a:hover {
												outline: none;
											}

											.anchor-point {
												position: relative;
												bottom: 5rem;
											}


										${style}
									</style>
								</head>
								<body>
									${body}
								</body>
							</html>
						`;
						handle_result(content, subscriber);
					} catch (e) {
						subscriber.error(e);
					}
					subscriber.complete();
				}
			);
		});
		return constructed_html;
	};
