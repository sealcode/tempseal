import {
	createReadStream,
	createWriteStream,
	stat,
	access,
	writeFile,
	link,
	unlink,
} from "fs";
import { get } from "https";

import { promisify } from "util";
import { Readable } from "stream";
import * as assert from "assert";
import { MD5 } from "object-hash";
import { basename, extname, resolve, isAbsolute, dirname } from "path";
import makeDir from "make-dir";
import { LinkableSideEffect } from "./side-effect";

const asyncStat = promisify(stat);
const asyncAccess = promisify(access);

type Writable = Readable | string | Buffer;

async function fileExists(path: string) {
	try {
		await asyncAccess(path);
		return true;
	} catch (e) {
		return false;
	}
}

export type GeneratorFn = () => Writable | Promise<Writable>;

export class FileSideEffect extends LinkableSideEffect {
	generator: GeneratorFn;
	deps: Array<any>;
	filename: string;
	extension: string;
	basename: string;
	name_is_exact: boolean;
	constructor(
		filename: string,
		generator: GeneratorFn,
		deps: Array<any>,
		name_is_exact = false
	) {
		super();
		this.type_name = "file";
		this.generator = generator;
		this.deps = deps;
		this.filename = filename;
		this.extension = extname(filename);
		this.basename = basename(filename).slice(
			0,
			filename.length - this.extension.length
		);
		this.name_is_exact = name_is_exact;
	}
	async hash() {
		const deps_resolved = await Promise.all(this.deps);
		return MD5(deps_resolved);
	}

	getOutputFilename(): string {
		return `${this.basename}-${this._hash}${this.extension}`;
	}

	async _write(output_dir: string): Promise<string> {
		const input = await this.generator();
		const output_path = resolve(output_dir, this.getOutputFilename());
		await makeDir(dirname(output_path));
		if (input instanceof Readable) {
			const output = createWriteStream(output_path);
			await new Promise((resolve, reject) => {
				input.pipe(output);
				output.on("finish", () => {
					resolve();
				});
				input.on("error", reject);
				output.on("error", reject);
			});
		} else {
			await promisify(writeFile)(output_path, input);
		}
		if (this.name_is_exact) {
			const exact_path = resolve(output_dir, this.filename);
			await makeDir(dirname(exact_path));
			if (await fileExists(exact_path)) {
				await promisify(unlink)(exact_path);
			}
			await promisify(link)(output_path, exact_path);
		}
		return output_path;
	}

	async _isWriteNecessary(output_dir: string): Promise<Boolean> {
		const filename = await this.getOutputFilename();
		try {
			await asyncAccess(resolve(output_dir, filename));
			return false;
		} catch (e) {
			return true;
		}
	}

	async write(
		output_dir: string
	): Promise<{ path: string; write_was_needed: boolean }> {
		if (await this._isWriteNecessary(output_dir)) {
			try {
				await this._write(output_dir);
			} catch (e) {
				if (e.code === "ENOENT" && e.syscall === "open") {
					await makeDir(output_dir);
					await this._write(output_dir);
				} else {
					throw e;
				}
			}
			return {
				path: resolve(output_dir, await this.getOutputFilename()),
				write_was_needed: true,
			};
		} else {
			return {
				path: resolve(output_dir, await this.getOutputFilename()),
				write_was_needed: false,
			};
		}
	}

	getURL(url_prefix: string): string {
		return `${url_prefix}${this.getOutputFilename()}`;
	}

	static fromPath(path: string): FileSideEffect {
		assert.ok(isAbsolute(path), `Path '${path}' is not an absolute path`);
		const mtime_promise = asyncStat(path).then((stat) => stat.mtime);
		return new FileSideEffect(
			basename(path),
			() => createReadStream(path),
			[path, mtime_promise]
		);
	}

	static async fromURL(_url: string): Promise<FileSideEffect> {
		const url = new URL(_url);

		return new FileSideEffect(
			basename(url.pathname),
			() =>
				new Promise((resolve, reject) => {
					get(_url, (res) => {
						resolve(res);
					});
				}),
			[_url]
		);
	}
}
