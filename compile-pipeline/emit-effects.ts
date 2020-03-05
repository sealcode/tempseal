import { Observable } from "rxjs";
import { shareReplay } from "rxjs/operators";
import {
	ComponentMap,
	TempsealDocument,
	IComponent,
	SideEffect,
	Config
} from "../";

export function emitEffects(
	components: ComponentMap,
	config: Config.Config,
	document: TempsealDocument
): Observable<SideEffect> {
	return new Observable<SideEffect>(subscriber => {
		const promises = [];
		const hashes = new Set<string>();
		const add_effect = (
			effect_promise: Promise<SideEffect> | SideEffect
		) => {
			const promise = new Promise<SideEffect>(async (resolve, reject) => {
				const effect = await effect_promise;

				let hash;
				try {
					hash = await effect.getHash();
					if (!hashes.has(hash)) {
						hashes.add(hash);
						subscriber.next(effect);
					}
					resolve(effect);
				} catch (e) {
					console.error(e);
					subscriber.error(e);
					console.error(effect);
					reject(e);
				}
			});
			promises.push(promise);
			return promise;
		};
		for (let { component_name, props } of document) {
			let component: IComponent;
			component = components.get(component_name);
			promises.push(component(add_effect, config, props));
		}
		Promise.all(promises)
			.then(() => {
				console.log("done emitting!");
				subscriber.complete();
			})
			.catch(error => {
				subscriber.error(error);
			});

		// is shareReplay necessary here??
	}).pipe(shareReplay());
}
