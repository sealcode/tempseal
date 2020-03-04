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

				const hash = await effect.getHash();
				if (!hashes.has(hash)) {
					hashes.add(hash);
					console.log("emitting!", effect);
					subscriber.next(effect);
				}
				resolve(effect);
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
				console.log("emitting end");
				subscriber.complete();
			})
			.catch(error => {
				subscriber.error(error);
			});

		// is shareReplay necessary here??
	}).pipe(shareReplay());
}
