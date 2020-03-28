import { Observable } from "rxjs";
import { join } from "path";
import makeDir from "make-dir";
import { SideEffects } from "../../";

export interface WriteEvent {
	file_name: string;
	type: "wrote" | "skipped";
}

export const write = (
	output_dir: string,
	cache_dir: string = join(output_dir, ".cache")
) =>
	function (
		file_effects: Observable<SideEffects.File>
	): Observable<WriteEvent> {
		const dir_ready = makeDir(cache_dir);
		return new Observable((subscriber) => {
			const promises: Promise<any>[] = [];
			file_effects.subscribe(
				(effect: SideEffects.File) => {
					if (effect.write) {
						promises.push(
							dir_ready
								.then(() => effect.write(output_dir))
								.then((result) =>
									subscriber.next({
										file_name: result.path.replace(
											output_dir,
											""
										),
										type: result.write_was_needed
											? "wrote"
											: "skipped",
									})
								)
								.catch((e) => {
									console.error(e.stack);
									subscriber.error(e);
								})
						);
					}
				},
				(e) => subscriber.error(e),
				() => {
					Promise.all(promises).then(() => {
						subscriber.complete();
					});
				}
			);
		});
	};
