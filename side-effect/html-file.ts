import { FileSideEffect } from "./file";
import { MD5 } from "object-hash";

export default class HtmlFile extends FileSideEffect {
	constructor(target_url: string, content: string) {
		super(target_url, () => content, [content]);
	}
}
