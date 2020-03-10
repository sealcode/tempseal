import { Observable } from "rxjs";
import { SideEffects, SideEffect } from "../../";

export interface WriteEvent {
	file_name: string;
	type: "wrote" | "skipped";
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
							effect
								.write(output_dir)
								.then(result =>
									subscriber.next({
										file_name: result.path.replace(
											output_dir,
											""
										),
										type: result.write_was_needed
											? "wrote"
											: "skipped"
									})
								)
								.catch(e => {
									console.error(e.stack);
									subscriber.error(e);
								})
						);
					}
				},
				e => subscriber.error(e),
				() => {
					Promise.all(promises).then(() => {
						subscriber.complete();
					});
				}
			);
		});
	};
