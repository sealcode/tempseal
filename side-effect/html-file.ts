import { join } from "path";
import { MD5 } from "object-hash";
import { FileSideEffect } from "./file";

export default class HtmlFile extends FileSideEffect {
	constructor(target_url: string, content: string) {
		super(target_url, () => content, [MD5(content)], true);
	}
	getOutputFilename(): string {
		return join("_html", super.getOutputFilename());
	}
}
