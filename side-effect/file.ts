import { createReadStream, createWriteStream, stat, access } from "fs";
import { promisify } from "util";
import { Readable } from "stream";
import * as assert from "assert";
import { MD5 } from "object-hash";
import { basename, extname, resolve, isAbsolute } from "path";
import makeDir = require("make-dir");
import { SideEffect } from "./side-effect";

const asyncStat = promisify(stat);
const asyncAccess = promisify(access);

export class FileSideEffect extends SideEffect {
	name: "file";
	generator: () => Readable;
	deps: Array<any>;
	filename: string;
	extension: string;
	basename: string;
	constructor(filename: string, generator: () => Readable, deps: Array<any>) {
		super();
		this.generator = generator;
		this.deps = deps;
		this.filename = filename;
		this.extension = extname(filename);
		this.basename = basename(filename).slice(
			0,
			filename.length - this.extension.length
		);
	}
	async hash() {
		return MD5(this.deps);
	}

	async getOutputFilename(): Promise<string> {
		return `${this.basename}-${await this.getHash()}${this.extension}`;
	}

	async _write(output_dir: string): Promise<string> {
		const input = this.generator();
		const output = createWriteStream(
			resolve(output_dir, await this.getOutputFilename())
		);
		input.pipe(output);
		return new Promise((resolve, reject) => {
			output.on("end", resolve);
			input.on("error", reject);
			output.on("error", reject);
		});
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

	async write(output_dir: string) {
		if (await this._isWriteNecessary(output_dir)) {
			try {
				await this._write(output_dir);
			} catch (e) {
				if (e.code === "ENOENT" && e.syscall === "open") {
					console.log(
						`Directory ${output_dir} not found, attempting to create it...`
					);
					await makeDir(output_dir);
					await this._write(output_dir);
				} else {
					throw e;
				}
			}
		} else {
			console.log(
				"skipping writing file",
				await this.getOutputFilename()
			);
		}
	}

	async getURL(url_prefix: string): Promise<string> {
		return `${url_prefix}/${await this.getOutputFilename()}`;
	}

	static async fromPath(path: string): Promise<FileSideEffect> {
		assert.ok(isAbsolute(path), `Path '${path}' is not an absolute path`);
		const fileInfo = await asyncStat(path);
		return new FileSideEffect(
			basename(path),
			() => createReadStream(path),
			[path, fileInfo.mtime]
		);
	}
}
