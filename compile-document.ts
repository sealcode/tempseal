import { ComponentMap, TempsealDocument, IComponent } from "./";
import { Observable, from } from "rxjs";
import { map } from "rxjs/operators";

export async function compileDocument(
	components: ComponentMap,
	document: TempsealDocument
) {
	const outputs = from(document).pipe(
		map(({ component_name, props }) => {
			let component: IComponent;
			try {
				component = components.get(component_name);
			} catch (e) {
				throw new Error(`Unknown component: '${component_name}'`);
			}
			return component(props);
		})
	);
}
