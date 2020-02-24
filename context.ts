import { FileSideEffect } from "./side-effect/file";
import { ScssSideEffect } from "./side-effect/scss";

export class Context {
	// output_dir: string;
	ScssSideEffect: typeof ScssSideEffect;
	FileSideEffect: typeof FileSideEffect;
	constructor() {
		// this.output_dir = output_dir;
		this.ScssSideEffect = ScssSideEffect;
		this.FileSideEffect = FileSideEffect;
	}
}
