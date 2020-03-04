import { Observable } from "rxjs";
import { SideEffect, SideEffects } from "../../";
import { findInStream } from "../utils/find-in-stream";

export const replaceUrlPlaceholders = (public_path_prefix: string) => (
	effects: Observable<SideEffect>
) =>
	new Observable<SideEffect>(subscriber => {
		const cache = new Map<String, SideEffect>();
		const promises = [] as Promise<any>[];

		effects.subscribe(
			effect => {
				if (effect instanceof SideEffects.HtmlChunk) {
					const required_hashes = effect.getReferencedHashes();
					const hash_promises = [];
					for (let required_hash of required_hashes) {
						if (cache.has(required_hash)) {
							hash_promises.push(cache.get(required_hash));
						} else {
							hash_promises.push(
								findInStream(effects, file_effect => {
									return (
										file_effect instanceof
											SideEffects.File &&
										file_effect._hash == required_hash
									);
								})
							);
						}
					}
					promises.push(
						Promise.all(hash_promises).then(
							(matching_effects: SideEffects.File[]) => {
								let chunk = effect.chunk;
								for (const matching_effect of matching_effects) {
									if (matching_effect) {
										chunk = chunk.replace(
											`#{${matching_effect._hash}}`,
											matching_effect.getURL(
												public_path_prefix
											)
										);
									} else {
										subscriber.error(
											`Could not find a file to one of this chunks replacement patterns: \n${chunk.replace(
												/</g,
												"&lt;"
											)}`
										);
									}
								}
								subscriber.next(
									new SideEffects.HtmlChunk(chunk)
								);
							}
						)
					);
				} else if (effect instanceof SideEffects.File) {
					cache.set(effect._hash as string, effect);
					subscriber.next(effect);
				} else {
					subscriber.next(effect);
				}
			},
			e => subscriber.error(e),
			async () => {
				await Promise.all(promises);
				subscriber.complete();
			}
		);
	});
