import { Observable } from "rxjs";
import { SideEffect, SideEffects, LinkableSideEffect } from "../../";
import { findInStream } from "../utils/find-in-stream";

export const replaceUrlPlaceholders = (
	public_path_prefix: string,
	emitted_hashes: Map<string, SideEffect>,
	target_file: string = "Optional filename for debug purposes not specified"
) => (effects: Observable<SideEffect>) =>
	new Observable<SideEffect>((subscriber) => {
		const promises = [] as Promise<any>[];
		let first_enc = true;
		const start = Date.now();
		effects.subscribe(
			(effect) => {
				if (first_enc) {
					first_enc = false;
					console.log(
						"time until first encounter in replaceUrlPlaceholders:",
						Date.now() - start,
						"ms",
						target_file,
						Date.now()
					);
				}
				if (effect instanceof SideEffects.WithPlaceholders) {
					promises.push(
						Promise.resolve()
							.then(async () => {
								const required_hashes: string[] = await effect.getReferencedHashes();
								const hash_promises = [];
								for (let required_hash of required_hashes) {
									if (emitted_hashes.has(required_hash)) {
										hash_promises.push(
											emitted_hashes.get(required_hash)
										);
									} else {
										hash_promises.push(
											findInStream(
												effects,
												(file_effect) => {
													return (
														file_effect instanceof
															LinkableSideEffect &&
														file_effect._hash ==
															required_hash
													);
												}
											)
										);
									}
								}
								return Promise.all(hash_promises);
							})
							.then(
								async (
									matching_effects: SideEffects.File[]
								) => {
									let chunk = await effect.getContent();
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
									const new_effect = new (effect.constructor as {
										new (
											n: string
										): SideEffects.WithPlaceholders;
									})(chunk);
									new_effect.fillMetaDataFrom(effect);
									subscriber.next(new_effect);
								}
							)
					);
				} else if (effect instanceof SideEffects.File) {
					emitted_hashes.set(effect._hash as string, effect);
					subscriber.next(effect);
				} else {
					subscriber.next(effect);
				}
			},
			(e) => subscriber.error(e),
			async () => {
				await Promise.all(promises);
				subscriber.complete();
			}
		);
	});
