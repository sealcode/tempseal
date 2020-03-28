import { Observable } from "rxjs";
import {
	ComponentMap,
	TempsealDocument,
	IComponent,
	SideEffect,
	Config,
	Context,
} from "../";

export function emitEffects(
	components: ComponentMap,
	config: Config.Config,
	document: TempsealDocument,
	emitted_hashes: Map<string, SideEffect>
): Observable<SideEffect> {
	return new Observable<SideEffect>((subscriber) => {
		const promises = [];
		let order = 0;
		const document_emited_hashes: Set<string> = new Set<string>();
		const add_effect_gen = (order: number) => (
			effect_promise: Promise<SideEffect> | SideEffect
		) => {
			const promise = new Promise<SideEffect>(async (resolve, reject) => {
				const effect = await effect_promise;
				effect.setOrder(order);
				let hash;
				try {
					hash = await effect.getHash();
					if (
						!emitted_hashes.has(hash) ||
						(effect.reemit_across_documents &&
							!document_emited_hashes.has(hash))
					) {
						emitted_hashes.set(hash, effect);
						document_emited_hashes.add(hash);
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
		for (let { component_name, props } of document.segments) {
			let component: IComponent;
			component = components.get(component_name);
			const context = new Context(
				add_effect_gen(order),
				config,
				document.language
			);
			promises.push(component(context, props));
			order++;
		}
		Promise.all(promises)
			.then(() => {
				subscriber.complete();
			})
			.catch((error) => {
				subscriber.error(error);
			});

		// is shareReplay necessary here??
	});
}
