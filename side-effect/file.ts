import * as assert from "assert";
import {
	access,
	createReadStream,
	createWriteStream,
	lstat,
	stat,
	symlink,
	unlink,
	writeFile,
} from "fs";
import { get } from "https";
import makeDir from "make-dir";
import { MD5 } from "object-hash";
import {
	basename,
	dirname,
	extname,
	isAbsolute,
	join,
	relative,
	resolve,
} from "path";
import { Readable } from "stream";
import { promisify } from "util";
import { LinkableSideEffect } from "./side-effect";

const asyncStat = promisify(stat);
const asyncAccess = promisify(access);
const asyncLstat = promisify(lstat);

type Writable = Readable | string | Buffer;

async function fileExists(path: string) {
	try {
		await asyncAccess(path);
		return true;
	} catch (e) {
		return false;
	}
}

async function linkExists(path: string) {
	try {
		await asyncLstat(path);
		return true;
	} catch (e) {
		return false;
	}
}

export type GeneratorFn = () => Writable | Promise<Writable>;

export class FileSideEffect extends LinkableSideEffect {
	generator: GeneratorFn;
	deps: Array<any>;
	url_path: string;
	extension: string;
	basename: string;
	constructor(url_path: string, generator: GeneratorFn, deps: Array<any>) {
		super(false);
		this.type_name = "file";
		this.generator = generator;
		this.deps = deps;
		this.url_path = url_path;
		this.extension = extname(url_path);
		this.basename = basename(url_path).slice(
			0,
			basename(url_path).length - this.extension.length
		);
	}
	async hash() {
		const deps_resolved = await Promise.all(this.deps);
		return MD5(deps_resolved);
	}

	async getCacheFilename(): Promise<string> {
		return `${this.basename}-${await this.getHash()}${this.extension}`;
	}

	async write(
		output_dir: string
	): Promise<{ path: string; write_was_needed: boolean }> {
		// check if file is in cache
		const cache_filename = await this.getCacheFilename();
		const cache_file_path = join(output_dir, ".cache", cache_filename);
		let is_in_cache = true;
		// if not, create it
		if (!(await fileExists(cache_file_path))) {
			is_in_cache = false;
			const input = await this.generator();
			if (input instanceof Readable) {
				const output = createWriteStream(cache_file_path);
				await new Promise((resolve, reject) => {
					input.pipe(output);
					output.on("finish", () => {
						resolve();
					});
					input.on("error", reject);
					output.on("error", reject);
				});
			} else {
				await promisify(writeFile)(cache_file_path, input);
			}
		}
		// create a *.hash file that tells tempseal where the file is stored

		// link the url-nice file to it
		const nice_path = join(output_dir, this.url_path);
		await makeDir(dirname(nice_path));
		if (await linkExists(nice_path)) {
			await promisify(unlink)(nice_path);
		}
		await promisify(symlink)(
			relative(dirname(nice_path), cache_file_path),
			nice_path
		);
		return {
			path: resolve(output_dir, nice_path),
			write_was_needed: !is_in_cache,
		};
	}

	getURL(url_prefix: string): string {
		return `${url_prefix}${this.url_path}`;
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
