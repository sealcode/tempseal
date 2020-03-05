export interface ILayoutConfigObject {
	"container-width"?: string;
	"rem-size"?: number;
}

export class LayoutConfig {
	"container-width": string;
	"rem-size": number;
	constructor(layout: ILayoutConfigObject) {
		this["container-width"] = layout["container-width"] || "1200px";
		this["rem-size"] = layout["rem-size"] || 24;
	}
}
