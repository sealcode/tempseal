import { Observable } from "rxjs";
import { SideEffects, SideEffect } from "../../";

export interface WriteEvent {
	message: string;
}

export const write = (output_dir: string) =>
	function(
		file_effects: Observable<SideEffects.File>
	): Observable<WriteEvent> {
		return new Observable(subscriber => {
			const promises: Promise<any>[] = [];
			file_effects.subscribe(
				(effect: SideEffects.File) => {
					if (effect.write) {
						promises.push(
							effect.write(output_dir).then(result =>
								subscriber.next({
									message: result.path.replace(output_dir, "")
								})
							)
						);
					}
				},
				e => subscriber.error(e),
				() => {
					Promise.all(promises).then(() => {
						console.log(
							"@@@@@@@@@@@@@@@@@@@@@@@@@@ all writes finished"
						);
						subscriber.complete();
					});
				}
			);
		});
	};
