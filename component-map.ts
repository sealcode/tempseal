import { IComponent } from ".";

export default class ComponentMap {
	map: Map<String, IComponent>;

	constructor(components: Array<IComponent>) {
		this.map = new Map();
		for (let component of components) {
			this.add(component);
		}
	}
	add(component: IComponent) {
		if (!component.identifier) {
			throw new Error(
				"Component should have a static 'identifier' property"
			);
		}
		this.map.set(component.identifier, component);
	}
	get(component_name: string): IComponent {
		const component = this.map.get(component_name);
		if (!component) {
			throw new Error(`unknown component: ${component_name}`);
		}
		return component;
	}
}
