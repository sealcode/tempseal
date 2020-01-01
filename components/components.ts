import { ComponentConstructor } from "../component";
import { Button } from "./button";
import { ThumbnailParagraph } from "./thumbnail-paragraph/thumbnail-paragraph";

export class ComponentMap {
	map: Map<String, ComponentConstructor>;
	constructor(components: Array<ComponentConstructor>) {
		this.map = new Map();
		for (let component of components) {
			this.add(component);
		}
	}
	add(component: ComponentConstructor) {
		if (!component.identifier) {
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
	const ret = new ComponentMap([Button, ThumbnailParagraph]);
	return ret;
}
