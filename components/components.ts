import { IComponent } from "../component";
import { button } from "./button";
import { ThumbnailParagraph } from "./thumbnail-paragraph/thumbnail-paragraph";

export class ComponentMap {
	map: Map<String, IComponent>;
	constructor(components: Array<IComponent>) {
		this.map = new Map();
		for (let component of components) {
			this.add(component);
		}
	}
	add(component: IComponent) {
		if (!component.identifier) {
			console.log(component);
			throw new Error(
				"Component should have a static 'identifier' property"
			);
		}
		this.map.set(component.identifier, component);
	}
	get(component_name: string) {
		return this.map.get(component_name);
	}
}

export function getComponents(): ComponentMap {
	const ret = new ComponentMap([button, ThumbnailParagraph]);
	return ret;
}
