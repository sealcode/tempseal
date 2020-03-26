import { Observable, Subscriber } from "rxjs";

import { SideEffect, SideEffects } from "../../";

export const combineHtml = (
	handle_result: (
		content: string,
		subscriber: Subscriber<SideEffect>
	) => void | Promise<void>
) =>
	function (effects: Observable<SideEffect>): Observable<SideEffect> {
		let title = "";
		let style = "";
		let html_chunk_effects: SideEffects.HtmlChunk[] = [];

		const promises = [] as Promise<any>[];

		const constructed_html = new Observable<SideEffect>((subscriber) => {
			effects.subscribe(
				(effect) => {
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
				(e) => subscriber.error(e),
				async () => {
					try {
						await Promise.all(promises);
						const head = html_chunk_effects
							.filter((e) => e.disposition === "head")
							.map((e) => e.chunk)
							.join("\n");
						const body = html_chunk_effects
							.sort((e1, e2) => (e1.order < e2.order ? -1 : 1))
							.map((e) => e.chunk)
							.join("\n");
						const content = /* HTML */ `
							<!DOCTYPE html>
							<html>
								<meta charset="utf-8" />
								<meta
									name="viewport"
									content="width=device-width"
								/>
								<head>
									<title>${title}</title>
									${head}
									<style>
											html {
												font-size: 24px;
												scroll-behavior: smooth;
												font-display: fallback;
											}

											* {
												box-sizing: border-box;
												line-height: 1rem;
												font-size: calc( 10 / 12 * 1rem);
												margin: 0;
											}

											body {
												padding-left: 0;
												padding-bottom: 0;
												padding-right: 0;
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

											@media (max-width: 500px){
												h1{
													font-size: 1.5rem;
													line-height: 1.5rem;
													margin-top: 0.3rem;
													margin-bottom: 0.2rem;
												}
											}


											h2 {
												font-size: 1.25rem;
												line-height: 1.4rem;
												margin-top: 1.4rem;
												margin-bottom: 0.2rem;
											}
											h2:first-child {
												margin-top: 0.4rem;
											}

											@media (max-width: 500px){
												h2{
													font-size: 1.3rem;
													line-height: 1.4rem;
													margin-top: 0.4rem;
													margin-bottom: 0.2rem;
												}
											}

										    h3 {
												font-size: 1.05rem;
												line-height: 1.2rem;
												margin-top: 0.6rem;
												margin-bottom: 0.2rem;
											}

											input[type="submit"] {
												cursor: pointer;
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
