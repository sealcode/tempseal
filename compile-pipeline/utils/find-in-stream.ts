import { Observable } from "rxjs";
import { find } from "rxjs/operators";

export async function findInStream<T>(
	stream: Observable<T>,
	predicate: (element: T) => boolean
): Promise<T> {
	return new Promise(function(resolve) {
		stream.pipe(find(predicate)).subscribe((match: T) => {
			resolve(match);
		});
	});
}
