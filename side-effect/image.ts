import { basename, extname, join } from "path";
import { promisify } from "util";
import { stat, createReadStream } from "fs";
import { default as sharp } from "sharp";
import { FileSideEffect } from "./file";

export type TImagePostprocess = (image: sharp.Sharp) => sharp.Sharp;

function generate_filename(
	url_prefix: string,
	image_path: string,
	width: "original" | number,
	format: "original" | string
) {
	return join(
		"images",
		url_prefix,
		[
			basename(image_path),
			width,
			format == "original" ? extname(image_path).slice(1) : format,
		].join(".")
	);
}

export default class Image extends FileSideEffect {
	image_path: string;
	sharp_image: sharp.Sharp;
	format: string;
	width: "original" | number;
	mtime_promise: Promise<Date>;
	url_prefix: string;
	constructor(
		image_path: string,
		format: "original" | string = "original",
		width: "original" | number = "original",
		url_prefix: string = "",
		mtime_promise?: Promise<Date>
	) {
		if (!mtime_promise) {
			const start = Date.now();
			mtime_promise = promisify(stat)(image_path).then((info) => {
				console.log(
					"got mtime for",
					image_path,
					"in",
					Date.now() - start,
					"ms"
				);
				return info.mtime;
			});
		}
		if (extname(image_path) === ".svg") {
			super(
				basename(image_path),
				async () => createReadStream(image_path),
				[image_path, mtime_promise]
			);
		} else {
			super(
				generate_filename(url_prefix, image_path, width, format),
				async () => {
					return this.getProcessedImage().toBuffer();
				},
				[image_path, mtime_promise, format, width]
			);
		}
		this.image_path = image_path;
		this.format = format;
		this.width = width;
		this.url_prefix = url_prefix;
		this.mtime_promise = mtime_promise;
	}
	getSharpImage() {
		if (!this.sharp_image) {
			this.sharp_image = sharp(this.image_path);
		}
		return this.sharp_image;
	}
	getProcessedImage() {
		let image = this.getSharpImage();
		if (this.format !== "original") {
			image = image.toFormat(this.format);
		}
		if (this.width !== "original") {
			image = image.resize(this.width);
		}
		return image;
	}
	async getSize(): Promise<{ width: number; height: number }> {
		const { width, height } = await this.getSharpImage().metadata();
		if (!width || !height) {
			throw new Error(
				`Could not determine resolution of image '${this.image_path}'`
			);
		}
		const scaled_width = this.width === "original" ? width : this.width;
		return {
			width: scaled_width,
			height: Math.round((scaled_width / width) * height),
		};
	}
	async getFormat(): Promise<string> {
		const { format } = await this.getSharpImage().metadata();
		if (!format) {
			throw new Error(
				`could not assess the format of file '${this.image_path}'`
			);
		}
		return format;
	}
	toFormat(format: string): Image {
		return new Image(
			this.image_path,
			format,
			this.width,
			this.url_prefix,
			this.mtime_promise
		);
	}
	toWidth(width: number): Image {
		return new Image(
			this.image_path,
			this.format,
			width,
			this.url_prefix,
			this.mtime_promise
		);
	}
	async getBase64() {
		const buffer = await this.getProcessedImage().toBuffer();
		return buffer.toString("base64");
	}
}
